import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { errorResponse, successResponse, sanitizeHtml } from '@/lib/utils';
import { checkApiRateLimit, hashIp } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils';

// قراءة كل المشاريع - public (المنشور بس)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const onlyPublished = searchParams.get('all') !== 'true';

  const session = await auth();
  // غير الـ admin، بيشوف المنشور بس
  const isAdmin = session?.user?.role === 'ADMIN';

  const projects = await prisma.project.findMany({
    where: isAdmin && !onlyPublished ? {} : { isPublished: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      tags: true,
      price: true,
      isFeatured: true,
      isPublished: isAdmin,
      createdAt: true,
    },
  });

  return successResponse(projects);
}

// إنشاء مشروع - ADMIN only
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return errorResponse('غير مسموح', 401);
  if (session.user.role !== 'ADMIN') return errorResponse('غير مسموح', 403);

  // ✅ Rate limit إضافي
  const ip = getClientIp(req.headers);
  const limit = checkApiRateLimit(`projects:create:${await hashIp(ip)}`, 20, 60_000);
  if (!limit.ok) return errorResponse('كتير، استنى', 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('بيانات غير صالحة', 400);
  }

  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة', 400);
  }

  // ✅ تنظيف المحتوى من XSS
  const cleanContent = sanitizeHtml(parsed.data.content);

  try {
    const project = await prisma.project.create({
      data: { ...parsed.data, content: cleanContent },
    });
    return successResponse(project, 201);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return errorResponse('الـ slug ده موجود قبل كده', 409);
    }
    return errorResponse('فيه مشكلة', 500);
  }
}

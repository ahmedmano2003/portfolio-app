import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { projectSchema } from '@/lib/validations';
import { errorResponse, successResponse, sanitizeHtml } from '@/lib/utils';

// تعديل مشروع - ADMIN only
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('غير مسموح', 401);
  if (session.user.role !== 'ADMIN') return errorResponse('غير مسموح', 403);

  const { id } = await params;

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

  const cleanContent = sanitizeHtml(parsed.data.content);

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { ...parsed.data, content: cleanContent },
    });
    return successResponse(project);
  } catch (err: any) {
    if (err.code === 'P2002') return errorResponse('الـ slug ده موجود', 409);
    if (err.code === 'P2025') return errorResponse('المشروع مش موجود', 404);
    return errorResponse('فيه مشكلة', 500);
  }
}

// حذف مشروع - ADMIN only
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('غير مسموح', 401);
  if (session.user.role !== 'ADMIN') return errorResponse('غير مسموح', 403);

  const { id } = await params;

  try {
    await prisma.project.delete({ where: { id } });
    return successResponse({ ok: true });
  } catch (err: any) {
    if (err.code === 'P2025') return errorResponse('المشروع مش موجود', 404);
    return errorResponse('فيه مشكلة', 500);
  }
}

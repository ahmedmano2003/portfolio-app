import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { contactSchema } from '@/lib/validations';
import { errorResponse, successResponse, getClientIp } from '@/lib/utils';
import { checkApiRateLimit, hashIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // ✅ Rate limit صارم - 3 رسائل في 10 دقائق من نفس IP
  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);
  const limit = checkApiRateLimit(`contact:${ipHash}`, 3, 10 * 60 * 1000);
  if (!limit.ok) return errorResponse('بعت رسايل كتير، استنى شوية', 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('بيانات غير صالحة', 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة', 400);
  }

  // ✅ Honeypot check (الفرونت بيضيف حقل خفي اسمه website، لو متعمر = bot)
  if ((body as any)?.website) {
    // نظهر نجاح كاذب للـ bot - عشان ميعرفش
    return successResponse({ ok: true }, 200);
  }

  const session = await auth();

  await prisma.contactMessage.create({
    data: {
      ...parsed.data,
      userId: session?.user?.id,
      ipHash,
    },
  });

  return successResponse({ ok: true, message: 'تم استلام رسالتك' }, 201);
}

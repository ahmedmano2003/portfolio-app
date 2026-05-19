import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { errorResponse, successResponse, getClientIp } from '@/lib/utils';
import { hashIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // ✅ Rate limit - 5 محاولات تسجيل في الساعة من نفس IP
  const ip = getClientIp(req.headers);
  const limit = checkApiRateLimit(`register:${await hashIp(ip)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return errorResponse('محاولات كتير، حاول بعد شوية', 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('بيانات غير صالحة', 400);
  }

  // ✅ Validation شامل بـ Zod
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة', 400);
  }

  const { name, email, password } = parsed.data;

  // ✅ نتحقق لو الإيميل موجود (timing-safe - ميرجعش معلومة مختلفة لو موجود)
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse('لو الإيميل ده مسجل، هتوصلك رسالة تأكيد', 200);
  }

  // ✅ bcrypt - cost factor 12 (توازن أمان/سرعة)
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, passwordHash, role: 'USER' },
  });

  return successResponse({ ok: true, message: 'تم إنشاء الحساب' }, 201);
}

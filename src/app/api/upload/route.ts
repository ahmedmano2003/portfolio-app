import { auth } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/upload';
import { errorResponse, successResponse, getClientIp } from '@/lib/utils';
import { checkApiRateLimit, hashIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // ✅ لازم مستخدم مسجل
  const session = await auth();
  if (!session?.user) return errorResponse('سجل دخول الأول', 401);

  // ✅ Rate limit - 10 صور في الساعة لكل user
  const limit = checkApiRateLimit(`upload:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return errorResponse('وصلت الحد الأقصى للرفع', 429);

  // ✅ IP-based extra layer
  const ip = getClientIp(req.headers);
  const ipLimit = checkApiRateLimit(`upload-ip:${await hashIp(ip)}`, 20, 60 * 60 * 1000);
  if (!ipLimit.ok) return errorResponse('كتير', 429);

  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return errorResponse('مفيش ملف', 400);
    }

    // upload.ts بيتحقق من النوع/الحجم/يحول لـ webp/يشيل metadata
    const result = await saveUploadedImage(file);
    return successResponse(result, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'فشل الرفع', 400);
  }
}

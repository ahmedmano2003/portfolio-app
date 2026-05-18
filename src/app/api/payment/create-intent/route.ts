import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { paymentIntentSchema } from '@/lib/validations';
import { errorResponse, successResponse, getClientIp } from '@/lib/utils';
import { checkApiRateLimit, hashIp } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return errorResponse('سجل دخول الأول', 401);

  // ✅ Rate limit
  const ip = getClientIp(req.headers);
  const limit = checkApiRateLimit(`payment:${hashIp(ip)}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return errorResponse('محاولات كتير', 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('بيانات غير صالحة', 400);
  }

  const parsed = paymentIntentSchema.safeParse(body);
  if (!parsed.success) return errorResponse('بيانات غير صالحة', 400);

  // ✅ نجيب السعر من DB - منستلمش السعر من الفرونت أبداً (حماية من tampering)
  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId, isPublished: true },
  });

  if (!project || !project.price || project.price <= 0) {
    return errorResponse('المشروع مش متاح للشراء', 404);
  }

  const baseUrl = process.env.NEXTAUTH_URL!;

  try {
    // ✅ Create order أول حاجة في DB - عشان نتتبع
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        amount: project.price,
        status: 'PENDING',
      },
    });

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: project.title,
              description: project.description.slice(0, 200),
            },
            unit_amount: project.price, // ✅ السعر من DB مش من client
          },
          quantity: 1,
        },
      ],
      // ✅ metadata للربط الآمن - منعتمدش على client-side ids
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        projectId: project.id,
      },
      success_url: `${baseUrl}/dashboard?paid=1&order=${order.id}`,
      cancel_url: `${baseUrl}/projects/${project.slug}?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkout.id },
    });

    return successResponse({ url: checkout.url, sessionId: checkout.id });
  } catch (err) {
    console.error('Stripe error:', err);
    return errorResponse('مشكلة في إنشاء عملية الدفع', 500);
  }
}

import { z } from 'zod';

// ============================================
// كل المدخلات تتحقق منها هنا قبل ما توصل DB
// يحمي من: SQL injection, malformed data, XSS payloads
// ============================================

const strongPassword = z
  .string()
  .min(12, 'الباسورد لازم 12 حرف على الأقل')
  .max(128)
  .regex(/[a-z]/, 'لازم حرف صغير')
  .regex(/[A-Z]/, 'لازم حرف كبير')
  .regex(/[0-9]/, 'لازم رقم')
  .regex(/[^a-zA-Z0-9]/, 'لازم رمز خاص');

const safeName = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[\p{L}\s'-]+$/u, 'الاسم فيه رموز غير مسموح بها');

export const registerSchema = z
  .object({
    name: safeName,
    email: z.string().trim().toLowerCase().email().max(254),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'الباسوردات مش متطابقة',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const contactSchema = z.object({
  name: safeName,
  email: z.string().trim().toLowerCase().email().max(254),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export const projectSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'حروف صغيرة وأرقام و - فقط'),
  description: z.string().trim().min(10).max(500),
  content: z.string().trim().min(10).max(20000),
  coverImage: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
  price: z.number().int().nonnegative().max(10000000).optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const paymentIntentSchema = z.object({
  projectId: z.string().cuid(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;

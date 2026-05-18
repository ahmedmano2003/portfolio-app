import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { loginSchema } from './validations';
import { recordLoginAttempt, isRateLimited, hashIp } from './rate-limit';

/**
 * إعدادات الـ Authentication
 * - تشفير bcrypt للباسوردات (لا يتم تخزينها plain أبداً)
 * - rate limiting على محاولات الدخول
 * - JWT session (HttpOnly cookies)
 * - validation كل المدخلات بـ Zod
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 }, // أسبوع
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // ✅ Validate input بـ Zod - يحمي من injection و malformed data
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip =
          req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          req?.headers?.get('x-real-ip') ||
          'unknown';
        const ipHash = hashIp(ip);

        // ✅ Rate limiting - حماية من brute force
        const limited = await isRateLimited(email, ipHash);
        if (limited) {
          throw new Error('Too many failed attempts. Try again later.');
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // ✅ Timing-safe compare حتى لو المستخدم مش موجود (يمنع timing attacks)
        const hashToCompare = user?.passwordHash || '$2a$10$invalidinvalidinvalidinvalidin';
        const valid = await bcrypt.compare(password, hashToCompare);

        if (!user || !user.passwordHash || !valid) {
          await recordLoginAttempt(email, ipHash, false);
          return null;
        }

        await recordLoginAttempt(email, ipHash, true);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true, // ✅ مش هيوصله JS - حماية من XSS
        sameSite: 'lax', // ✅ حماية من CSRF
        path: '/',
        secure: process.env.NODE_ENV === 'production', // ✅ HTTPS فقط في production
      },
    },
  },
});

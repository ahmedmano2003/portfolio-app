import { prisma } from './db';

export function hashIp(ip: string): string {
  return Buffer.from(ip).toString('base64').slice(0, 32);
}

export async function isRateLimited(email: string, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const [emailFails, ipFails] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    }),
    prisma.loginAttempt.count({
      where: { ipHash, success: false, createdAt: { gte: since } },
    }),
  ]);
  return emailFails >= 5 || ipFails >= 20;
}

export async function recordLoginAttempt(email: string, ipHash: string, success: boolean) {
  await prisma.loginAttempt.create({ data: { email, ipHash, success } });
}

const apiHits = new Map<string, { count: number; resetAt: number }>();

export function checkApiRateLimit(key: string, limit = 30, windowMs = 60_000): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = apiHits.get(key);
  if (!entry || entry.resetAt < now) {
    apiHits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { ok: false, remaining: 0 };
  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}
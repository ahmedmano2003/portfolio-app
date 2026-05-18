'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('بيانات الدخول غير صحيحة');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('فيه مشكلة، حاول تاني');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-ink text-bone p-12 flex-col justify-between">
        <Link href="/" className="font-display text-2xl">
          <span className="italic">Atelier</span>
          <span className="text-rust">.</span>
        </Link>
        <div>
          <p className="font-display italic text-5xl leading-tight">
            "Good design is obvious. Great design is transparent."
          </p>
          <p className="mt-6 text-bone/60 text-sm uppercase tracking-widest">— Joe Sparano</p>
        </div>
        <div className="text-xs text-bone/40 font-mono">— studio access · v1</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ Sign in</span>
          <h1 className="font-display text-5xl mt-3 mb-8">
            Welcome <span className="italic">back</span>.
          </h1>

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-rust border-l-2 border-rust pl-3 py-1">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/60">
            New here?{' '}
            <Link href="/register" className="ink-link text-ink">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فيه مشكلة');
        return;
      }

      // ✅ Auto sign-in بعد التسجيل
      const signRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signRes?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('فشل الاتصال');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-rust text-bone p-12 flex-col justify-between">
        <Link href="/" className="font-display text-2xl">
          <span className="italic">Atelier</span>
          <span>.</span>
        </Link>
        <div>
          <p className="font-display italic text-5xl leading-tight">
            Join a small circle of builders, makers, and people who give a damn.
          </p>
        </div>
        <div className="text-xs text-bone/60 font-mono">— new member · welcome</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ Create account</span>
          <h1 className="font-display text-5xl mt-3 mb-8">
            Begin <span className="italic">here</span>.
          </h1>

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="At least 12 characters"
              />
              <p className="text-[10px] text-ink/50 mt-1">
                Min. 12 chars · upper · lower · number · symbol
              </p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-ink/60">Confirm</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
              />
            </div>

            {error && (
              <div className="text-sm text-rust border-l-2 border-rust pl-3 py-1">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating...' : 'Create account →'}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/60">
            Already a member?{' '}
            <Link href="/login" className="ink-link text-ink">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

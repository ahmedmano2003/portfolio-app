'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فيه مشكلة');
        setStatus('error');
        return;
      }
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setError('فشل الاتصال');
      setStatus('error');
    }
  }

  return (
    <>
      <header className="border-b border-ink/10">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl">
            <span className="italic">Atelier</span>
            <span className="text-rust">.</span>
          </Link>
          <Link href="/" className="text-sm uppercase tracking-widest ink-link">← Back</Link>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/60">§ Get in touch</span>
          <h1 className="font-display text-6xl md:text-7xl mt-3 leading-[0.95]">
            Let's <span className="italic text-rust">talk</span>.
          </h1>
          <p className="mt-6 text-ink/70 leading-relaxed max-w-md">
            Whether it's a brief, an idea, or just a hello — write to us. We reply to everything (eventually).
          </p>

          <dl className="mt-12 space-y-6 border-t border-ink/10 pt-8">
            <div>
              <dt className="text-xs uppercase tracking-widest text-ink/50 mb-1">Studio</dt>
              <dd className="font-display text-xl">Cairo · Worldwide</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-ink/50 mb-1">Inquiries</dt>
              <dd><a href="mailto:hello@atelier.com" className="ink-link">hello@atelier.com</a></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-ink/50 mb-1">Hours</dt>
              <dd>Mon–Fri · 09:00–18:00 EET</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-7">
          {status === 'success' ? (
            <div className="bg-ink text-bone p-12">
              <p className="font-display italic text-4xl mb-3">Got it.</p>
              <p className="text-bone/70">Thanks for reaching out — we'll be in touch within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              {/* ✅ Honeypot - مخفي عن البشر، البوتات بتعمره */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                aria-hidden="true"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/60">Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-ink/60">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/60">Subject</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-ink/60">Message</label>
                <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
              </div>

              {error && (
                <div className="text-sm text-rust border-l-2 border-rust pl-3 py-1">{error}</div>
              )}

              <button type="submit" disabled={status === 'loading'} className="btn-primary disabled:opacity-50">
                {status === 'loading' ? 'Sending...' : 'Send message →'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    coverImage: '',
    tags: '',
    price: '',
    isFeatured: false,
    isPublished: false,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.data?.url) {
        setForm((f) => ({ ...f, coverImage: data.data.url }));
      } else {
        setError(data.error || 'فشل رفع الصورة');
      }
    } catch {
      setError('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          price: form.price ? Math.round(parseFloat(form.price) * 100) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فيه مشكلة');
        return;
      }

      setForm({ title: '', slug: '', description: '', content: '', coverImage: '', tags: '', price: '', isFeatured: false, isPublished: false });
      router.refresh();
    } catch {
      setError('فشل الاتصال');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="Title">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
        />
      </Field>
      <Field label="Slug (URL)">
        <input
          type="text"
          required
          value={form.slug}
          onChange={(e) =>
            setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
          }
          className="input-field"
          placeholder="brand-launch-2024"
        />
      </Field>
      <Field label="Description">
        <textarea
          rows={2}
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field resize-none"
        />
      </Field>
      <Field label="Content (HTML, ينظف تلقائياً من XSS)">
        <textarea
          rows={4}
          required
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input-field resize-none font-mono text-xs"
        />
      </Field>
      <Field label="Tags (مفصولة بفاصلة)">
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="input-field"
          placeholder="branding, web design"
        />
      </Field>
      <Field label="Price (USD - فاضي = case study مجاني)">
        <input
          type="number"
          min="0"
          step="1"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="input-field"
          placeholder="49"
        />
      </Field>
      <Field label="Cover image">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
          className="text-sm"
        />
        {uploading && <p className="text-xs text-ink/50 mt-1">جاري الرفع...</p>}
        {form.coverImage && (
          <p className="text-xs text-moss mt-1 font-mono">✓ {form.coverImage}</p>
        )}
      </Field>

      <div className="flex gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Publish
        </label>
      </div>

      {error && (
        <div className="text-sm text-rust border-l-2 border-rust pl-3 py-1">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? 'Saving...' : 'Create project →'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-ink/60 block mb-1">{label}</label>
      {children}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  price: number | null;
  isFeatured: boolean;
  isPublished: boolean;
};

export function EditProjectForm({ project }: { project: Project }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: project.title,
    slug: project.slug,
    description: project.description,
    content: project.content,
    coverImage: project.coverImage || '',
    tags: project.tags.join(', '),
    price: project.price ? String(project.price / 100) : '',
    isFeatured: project.isFeatured,
    isPublished: project.isPublished,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ رفع صورة من الجهاز مباشرة
  async function uploadImage(file: File) {
    // validation أساسي في الفرونت
    if (file.size > 5 * 1024 * 1024) {
      setError('الصورة أكبر من 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('الملف ده مش صورة');
      return;
    }

    setUploading(true);
    setUploadProgress('جاري الرفع...');
    setError('');

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل الرفع');
        setUploadProgress('');
        return;
      }

      setForm((f) => ({ ...f, coverImage: data.data.url }));
      setUploadProgress('✓ تم الرفع بنجاح');
    } catch {
      setError('فشل الاتصال');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
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

      setSuccess('✓ تم الحفظ');
      router.refresh();
    } catch {
      setError('فشل الاتصال');
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm(`هتحذف "${project.title}" — متعملش undo. متأكد؟`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/projects');
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error || 'فشل الحذف');
        setDeleting(false);
      }
    } catch {
      setError('فشل الاتصال');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-6" noValidate>

      {/* ====== الصورة - أهم حاجة ====== */}
      <div className="border border-ink/10 p-6 bg-ink/[0.02]">
        <label className="text-xs uppercase tracking-widest text-ink/60 block mb-4">
          Cover Image
        </label>

        {/* Preview */}
        {form.coverImage && (
          <div className="mb-4 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.coverImage}
              alt="cover preview"
              className="w-full max-h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
              className="absolute top-2 right-2 bg-ink text-bone text-xs px-2 py-1 hover:bg-rust transition-colors"
            >
              ✕ إزالة
            </button>
          </div>
        )}

        {/* رفع من الجهاز */}
        <div
          className="border-2 border-dashed border-ink/20 p-8 text-center cursor-pointer hover:border-rust transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) uploadImage(file);
          }}
          onClick={() => document.getElementById('img-upload')?.click()}
        >
          <input
            id="img-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = ''; // reset عشان تقدر ترفع نفس الملف تاني
            }}
          />
          {uploading ? (
            <div className="text-ink/60">
              <div className="w-6 h-6 border-2 border-rust border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              {uploadProgress}
            </div>
          ) : (
            <div>
              <p className="text-2xl mb-2">📷</p>
              <p className="text-sm text-ink/70">اسحب صورة هنا أو <span className="text-rust underline">اختر من جهازك</span></p>
              <p className="text-xs text-ink/40 mt-1">JPG · PNG · WebP · GIF — max 5MB</p>
            </div>
          )}
        </div>

        {uploadProgress && !uploading && (
          <p className="text-xs text-moss mt-2">{uploadProgress}</p>
        )}

        {/* أو URL مباشر */}
        <div className="mt-4">
          <label className="text-xs text-ink/50 block mb-1">أو حط URL مباشر</label>
          <input
            type="url"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="input-field text-sm"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* ====== باقي الحقول ====== */}
      <div className="grid md:grid-cols-2 gap-6">
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
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={2}
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field resize-none"
        />
      </Field>

      <Field label="Content (HTML)">
        <textarea
          rows={8}
          required
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input-field resize-none font-mono text-xs"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Tags (مفصولة بفاصلة)">
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="input-field"
            placeholder="branding, web design"
          />
        </Field>
        <Field label="Price (USD — فاضي = مجاني)">
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
      </div>

      <div className="flex gap-8 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="w-4 h-4 accent-rust"
          />
          <span className="text-sm">Featured ✦</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 accent-rust"
          />
          <span className="text-sm">Published ● Live</span>
        </label>
      </div>

      {/* Messages */}
      {error && (
        <div className="text-sm text-rust border-l-2 border-rust pl-3 py-1">{error}</div>
      )}
      {success && (
        <div className="text-sm text-moss border-l-2 border-moss pl-3 py-1">{success}</div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-ink/10">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="text-sm text-ink/50 hover:text-rust transition-colors disabled:opacity-50"
        >
          {deleting ? 'جاري الحذف...' : '✕ حذف المشروع'}
        </button>

        <div className="flex gap-3">
          <a href={`/projects/${form.slug}`} target="_blank" className="btn-secondary !py-2 !px-4 text-xs">
            Preview →
          </a>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save changes →'}
          </button>
        </div>
      </div>
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

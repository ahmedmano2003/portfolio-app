'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BuyButton({ projectId, loggedIn }: { projectId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (!loggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error || 'فيه مشكلة');
        setLoading(false);
      }
    } catch {
      alert('فشل الاتصال');
      setLoading(false);
    }
  }

  return (
    <button onClick={handleBuy} disabled={loading} className="bg-rust text-bone px-6 py-3 text-sm uppercase tracking-widest font-medium hover:tracking-[0.2em] transition-all disabled:opacity-50">
      {loading ? 'Loading...' : 'Buy now →'}
    </button>
  );
}

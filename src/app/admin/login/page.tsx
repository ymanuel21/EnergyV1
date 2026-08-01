'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage({ error }: { error?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const res = await fetch('/api/login', { method: 'POST', body: fd, redirect: 'manual' });
    if (res.redirected || res.ok) {
      router.push('/admin');
    } else {
      router.push('/admin/login?error=1');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-primary">EBTPlaza Admin</h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">Email atau password salah</p>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-primary">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-primary">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </div>
      </form>
    </div>
  );
}

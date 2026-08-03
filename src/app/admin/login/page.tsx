'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  CredentialsSignin: { title: 'Login Gagal', desc: 'Email atau password tidak sesuai.' },
  AccessDenied: { title: 'Akses Ditolak', desc: 'Akun Anda tidak memiliki izin untuk mengakses halaman ini.' },
  Configuration: { title: 'Kesalahan Server', desc: 'Terjadi masalah konfigurasi. Silakan hubungi administrator.' },
  SessionRequired: { title: 'Sesi Diperlukan', desc: 'Silakan login terlebih dahulu untuk melanjutkan.' },
  default: { title: 'Login Gagal', desc: 'Tidak dapat login. Silakan coba lagi.' },
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ title: string; desc: string } | null>(null);

  useEffect(() => {
    const errorCode = params.get('error');
    if (errorCode) setAlert(ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default);
  }, [params]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 6000);
    return () => clearTimeout(timer);
  }, [alert]);

  function handleInputChange() { setAlert(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setAlert(null);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const res = await fetch('/api/login', { method: 'POST', body: fd, redirect: 'manual' });
      if (res.redirected || res.ok) { router.push('/admin'); return; }
      const code = res.status === 401 ? 'CredentialsSignin' : res.status === 403 ? 'AccessDenied' : res.status === 500 ? 'Configuration' : 'default';
      setAlert(ERROR_MESSAGES[code] || ERROR_MESSAGES.default);
    } catch { setAlert(ERROR_MESSAGES.default); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-bold text-primary">EBTPlaza Admin</h1>

        {alert && (
          <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-3">
            <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">{alert.title}</p>
              <p className="text-xs text-red-600 mt-0.5">{alert.desc}</p>
            </div>
            <button type="button" onClick={() => setAlert(null)} className="shrink-0 text-red-400 hover:text-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-primary">Email</label>
            <input id="email" name="email" type="email" required onChange={handleInputChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-primary">Password</label>
            <input id="password" name="password" type="password" required onChange={handleInputChange}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface"><div className="animate-pulse text-muted text-sm">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

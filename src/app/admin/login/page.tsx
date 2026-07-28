import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login — EBTPlaza',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm"
      >
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
          <button type="submit" className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">
            Masuk
          </button>
        </div>
      </form>
    </div>
  );
}

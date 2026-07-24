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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-center text-xl font-bold text-gray-900">EBTPlaza Admin</h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">Email atau password salah</p>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Masuk
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminToastProvider } from './AdminToastProvider';

const NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Produk', href: '/admin/products' },
  { label: 'Kategori', href: '/admin/categories' },
  { label: 'Brand', href: '/admin/brands' },
  { label: 'Artikel', href: '/admin/articles' },
  { label: 'FAQ', href: '/admin/faq' },
  { label: 'Halaman', href: '/admin/pages' },
  { label: 'Banner', href: '/admin/banners' },
  { label: 'Pengaturan', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  if (isLogin) return <>{children}</>;

  return (
    <AdminToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4 flex flex-col">
          <Link href="/admin" className="mb-6 block text-lg font-bold text-brand-700">
            EBTPlaza Admin
          </Link>
          <nav className="flex-1 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-brand-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-gray-100">
            <form action="/api/auth/signout" method="POST">
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100">
                Logout
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AdminToastProvider>
  );
}

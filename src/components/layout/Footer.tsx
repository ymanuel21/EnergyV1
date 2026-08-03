import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site';
import { getPublicNavigationLinks } from '@/lib/api/navigation';
import { cache } from '@/lib/platform';

export async function Footer() {
  const { name, email, phone, tagline } = SITE_CONFIG;
  const nav = await cache.getOrSet('nav:footer', 300, () =>
    getPublicNavigationLinks().catch(() => ({} as Record<string, { label: string; href: string }[]>))
  );
  const belanja = nav.footer_belanja || [];
  const layanan = nav.footer_layanan || [];
  const legal = nav.footer_legal || [];

  return (
    <footer className="bg-dark-bg border-t border-gray-800">
      <div className="mx-auto max-w-[var(--ebt-container,64rem)] px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-sm font-semibold text-white">{name}</span>
            <p className="mt-2 text-sm text-muted">{tagline}</p>
            <p className="mt-3 text-sm text-muted">{email} • {phone}</p>
          </div>
          {belanja.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Belanja</h3>
              <ul className="space-y-2 text-sm text-muted">
                {belanja.map((link: any) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-gray-300 transition">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {layanan.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Layanan</h3>
              <ul className="space-y-2 text-sm text-muted">
                {layanan.map((link: any) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-gray-300 transition">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-800 pt-8 sm:flex-row sm:justify-between">
          <span className="text-sm text-muted">© 2026 {name}. Seluruh hak cipta dilindungi.</span>
          <div className="flex gap-6 text-sm text-muted">
            {legal.map((link: any) => (
              <Link key={link.href} href={link.href} className="hover:text-gray-400 transition">{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

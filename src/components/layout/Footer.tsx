import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/site';
import { NAV_LINKS } from '@lib/constants';

export function Footer() {
  const { name, email, phone } = SITE_CONFIG;

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="mx-auto max-w-5xl px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-sm font-semibold text-white">{name}</span>
            <p className="mt-2 text-sm text-gray-500">Energi terbarukan untuk semua.</p>
            <p className="mt-3 text-sm text-gray-500">{email} • {phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Belanja</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {NAV_LINKS.footer.belanja.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gray-300 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Layanan</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {NAV_LINKS.footer.layanan.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gray-300 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-gray-800 pt-8 sm:flex-row sm:justify-between">
          <span className="text-sm text-gray-600">© 2026 {name}. Seluruh hak cipta dilindungi.</span>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/halaman/syarat-ketentuan" className="hover:text-gray-400 transition">Syarat &amp; Ketentuan</Link>
            <Link href="/halaman/kebijakan-privasi" className="hover:text-gray-400 transition">Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

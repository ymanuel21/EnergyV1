import Link from 'next/link';
import { Container } from '@ui/Container';
import { NewsletterForm } from '@components/forms/NewsletterForm';
import { SITE, NAV_LINKS } from '@lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container>
        <div className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700">
                <span className="text-sm font-extrabold text-white">E</span>
              </div>
              <span className="text-lg font-extrabold text-brand-700">
                Energi<span className="text-accent-500">.Click</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {SITE.name} (by {SITE.company}) — {SITE.tagline}.
            </p>
            <p className="mt-3 text-sm text-gray-500">{SITE.address}</p>
            <p className="mt-1 text-sm text-gray-500">
              {SITE.email} • {SITE.phone}
            </p>
          </div>

          {/* Belanja */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Belanja
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {NAV_LINKS.footer.belanja.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-700 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
              Layanan
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              {NAV_LINKS.footer.layanan.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-700 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 py-6 text-sm text-gray-400 sm:flex-row">
          <p>© 2026 {SITE.name} (by {SITE.company}). Seluruh hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/halaman/syarat-ketentuan" className="hover:text-brand-700 transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/halaman/kebijakan-privasi" className="hover:text-brand-700 transition-colors">
              Privasi
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

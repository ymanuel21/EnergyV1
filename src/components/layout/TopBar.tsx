import Link from 'next/link';
import { Container } from '@ui/Container';
import { NAV_LINKS } from '@lib/constants';

export function TopBar() {
  return (
    <div className="bg-brand-700 text-white">
      <Container>
        <div className="flex items-center justify-between py-1.5 text-xs">
          <p className="font-medium">Energi Cerdas, Tinggal Klik!</p>
          <nav aria-label="Menu utilitas" className="hidden sm:block">
            <ul className="flex items-center gap-4">
              {NAV_LINKS.utility.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </div>
  );
}

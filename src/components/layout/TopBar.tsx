import Link from 'next/link';
import { NAV_LINKS } from '@lib/constants';

export function TopBar() {
  return (
    <div className="bg-gray-900 text-white text-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-1.5">
        <p className="hidden sm:block text-gray-400">Pengiriman ke seluruh Indonesia</p>
        <nav aria-label="Menu utilitas">
          <ul className="flex items-center gap-4">
            {NAV_LINKS.utility.slice(0, 4).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

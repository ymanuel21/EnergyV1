import Link from 'next/link';
import { NAV_LINKS } from '@lib/constants';

export function CategoryNav() {
  return (
    <nav aria-label="Kategori" className="border-b border-gray-100 bg-white">
      <div className="overflow-x-auto scrollbar-hide">
        <ul className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          {NAV_LINKS.categories.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="block whitespace-nowrap px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import Link from 'next/link';
import { Container } from '@ui/Container';
import { IconButton } from '@ui/IconButton';
import { SearchBar } from '@components/forms/SearchBar';
import { HeartIcon, UserIcon, HamburgerIcon, CompareIcon } from '@ui/Icons';
import { CartHeaderButton } from './CartHeaderButton';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Beranda Energi.Click">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
                <span className="text-sm font-extrabold text-white">E</span>
              </div>
              <span className="hidden text-lg font-extrabold text-brand-700 sm:inline">
                Energi<span className="text-accent-500">.Click</span>
              </span>
            </div>
          </Link>

          {/* Category button */}
          <button className="hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:inline-flex">
            <HamburgerIcon className="h-5 w-5" />
            Semua Kategori
          </button>

          {/* Search */}
          <div className="flex-1">
            <SearchBar />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1">
            <Link href="/perbandingan">
              <IconButton label="Perbandingan">
                <CompareIcon />
              </IconButton>
            </Link>
            <Link href="/wishlist">
              <IconButton label="Wishlist">
                <HeartIcon />
              </IconButton>
            </Link>
            <CartHeaderButton />
            <IconButton label="Akun">
              <UserIcon />
            </IconButton>

            {/* Mobile hamburger */}
            <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-brand-700 hover:bg-gray-100 lg:hidden" aria-label="Menu">
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}

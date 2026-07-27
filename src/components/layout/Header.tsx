import Link from 'next/link';
import { IconButton } from '@ui/IconButton';
import { SearchBar } from '@components/forms/SearchBar';
import { HeartIcon, UserIcon } from '@ui/Icons';
import { CartHeaderButton } from './CartHeaderButton';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { CompareHeaderButton } from './CompareHeaderButton';
import { SITE_CONFIG } from '@/lib/site';

export function Header() {
  const { logo } = SITE_CONFIG;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`Beranda ${SITE_CONFIG.name}`}>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            {logo.text}
          </span>
        </Link>

        {/* Mega menu */}
        <MegaMenu />

        {/* Search */}
        <div className="hidden flex-1 sm:block">
          <SearchBar />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <CompareHeaderButton />
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
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

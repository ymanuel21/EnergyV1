import Link from 'next/link';
import { Container } from '@ui/Container';
import { IconButton } from '@ui/IconButton';
import { SearchBar } from '@components/forms/SearchBar';
import { HeartIcon, UserIcon, CompareIcon } from '@ui/Icons';
import { CartHeaderButton } from './CartHeaderButton';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { CompareHeaderButton } from './CompareHeaderButton';
import { SITE_CONFIG } from '@/lib/site';

export function Header() {
  const { logo } = SITE_CONFIG;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`Beranda ${SITE_CONFIG.name}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
                <span className="text-sm font-extrabold text-white">{logo.letter}</span>
              </div>
              <span className="hidden text-lg font-extrabold text-brand-700 sm:inline">
                {logo.text}
              </span>
            </div>
          </Link>

          {/* Mega menu */}
          <MegaMenu />

          {/* Search */}
          <div className="flex-1">
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
      </Container>
    </header>
  );
}

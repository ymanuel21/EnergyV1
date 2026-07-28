'use client';

import { useState, useEffect } from 'react';
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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll when search expanded
  useEffect(() => {
    if (searchExpanded) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [searchExpanded]);

  return (
    <header className="sticky top-0 z-40 w-full bg-card/70 backdrop-blur-2xl border-b border-border/50">
      {/* Normal header */}
      <div className={`mx-auto flex h-14 max-w-[var(--ebt-container,64rem)] items-center gap-4 px-2 sm:px-8 transition-all duration-300 ${searchExpanded ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={`Beranda ${SITE_CONFIG.name}`}>
          <span className="text-lg font-semibold tracking-tight text-primary">
            {logo.text}
          </span>
        </Link>

        <MegaMenu />

        <div className="flex-1">
          <SearchBar onFocusMobile={() => isMobile && setSearchExpanded(true)} />
        </div>

        <div className="flex items-center gap-1">
          <CompareHeaderButton />
          <Link href="/wishlist">
            <IconButton label="Wishlist"><HeartIcon /></IconButton>
          </Link>
          <CartHeaderButton />
          <IconButton label="Akun"><UserIcon /></IconButton>
          <MobileMenu />
        </div>
      </div>

      {/* Expanded mobile search overlay */}
      <div className={`absolute inset-0 flex h-14 items-center gap-2 bg-card/95 backdrop-blur-2xl px-2 transition-all duration-300 ${searchExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        {/* Back button */}
        <button
          onClick={() => setSearchExpanded(false)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-primary transition"
          aria-label="Tutup pencarian"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Full-width search */}
        <div className="flex-1">
          <SearchBar expanded onFocusMobile={() => {}} onCloseMobile={() => setSearchExpanded(false)} />
        </div>
      </div>
    </header>
  );
}

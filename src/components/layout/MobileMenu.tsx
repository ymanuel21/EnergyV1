'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { NAV_LINKS } from '@lib/constants';
import { SITE_CONFIG } from '@/lib/site';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Portal needs client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function handleClose() {
    setOpen(false);
  }

  const menuPortal = mounted && open ? createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 z-[9999] w-72 bg-white shadow-2xl lg:hidden"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/" onClick={handleClose} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-extrabold text-white">E</span>
            </div>
            <span className="text-base font-extrabold text-primary">
              {SITE_CONFIG.logo.text}
            </span>
          </Link>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted hover:text-muted hover:bg-surface"
            aria-label="Tutup menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <nav className="h-[calc(100%-57px)] overflow-y-auto px-5 py-4" aria-label="Mobile navigation">
          {/* Primary links */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Menu
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.utility.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Kategori
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface hover:text-primary"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Layanan
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.footer.layanan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:text-primary hover:bg-surface lg:hidden"
        aria-label="Buka menu"
        aria-expanded={open}
      >
        <HamburgerIcon className="h-5 w-5" />
      </button>

      {menuPortal}
    </>
  );
}

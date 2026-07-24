'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { NAV_LINKS } from '@lib/constants';
import { SITE_CONFIG } from '@/lib/site';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-brand-700 hover:bg-gray-100 lg:hidden"
        aria-label="Buka menu"
        aria-expanded={open}
      >
        <HamburgerIcon className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full invisible'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <Link href="/" onClick={handleClose} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700">
              <span className="text-xs font-extrabold text-white">E</span>
            </div>
            <span className="text-base font-extrabold text-brand-700">
              {SITE_CONFIG.logo.text}
            </span>
          </Link>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Tutup menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <nav className="overflow-y-auto px-5 py-4" aria-label="Mobile navigation">
          {/* Primary links */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Menu
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.utility.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Kategori
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Layanan
            </h3>
            <ul className="space-y-0.5">
              {NAV_LINKS.footer.layanan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={handleClose}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}

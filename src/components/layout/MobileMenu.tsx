'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { SITE_CONFIG } from '@/lib/site';

interface NavLink { label: string; href: string; }

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navLinks, setNavLinks] = useState<{ header: NavLink[]; mobile: NavLink[]; footer_layanan: NavLink[] }>({ header: [], mobile: [], footer_layanan: [] });
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/navigation')
      .then(r => r.json())
      .then(data => setNavLinks(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const menuPortal = mounted && open ? createPortal(
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />
      <div ref={drawerRef} className="fixed inset-y-0 right-0 z-[9999] w-72 bg-card shadow-2xl lg:hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-extrabold text-white">E</span>
            </div>
            <span className="text-base font-extrabold text-primary">{SITE_CONFIG.logo.text}</span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:text-muted hover:bg-surface" aria-label="Tutup menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="h-[calc(100%-57px)] overflow-y-auto px-5 py-4">
          {navLinks.header.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Navigasi</h3>
              <ul className="space-y-0.5">
                {navLinks.header.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {navLinks.mobile.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Menu</h3>
              <ul className="space-y-0.5">
                {navLinks.mobile.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {navLinks.footer_layanan.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Layanan</h3>
              <ul className="space-y-0.5">
                {navLinks.footer_layanan.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:text-primary hover:bg-surface lg:hidden"
        aria-label="Buka menu" aria-expanded={open}>
        <HamburgerIcon className="h-5 w-5" />
      </button>
      {menuPortal}
    </>
  );
}

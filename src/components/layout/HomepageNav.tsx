'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { categories } from '@/lib/data/categories';

const CATEGORIES = categories.filter((c: any) => !c.parentId);

export function HomepageNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [close]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) close();
    };
    if (open) { document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }
  }, [open, close]);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">EBTPlaza</Link>
          <div className="hidden items-center gap-8 sm:flex">
            <button ref={btnRef} onClick={() => setOpen(v => !v)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              aria-expanded={open} aria-controls="home-mega" aria-haspopup="menu">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              Semua Kategori
            </button>
            {['Katalog','Tentang','Kontak'].map(l => (
              <Link key={l} href={l === 'Katalog' ? '/produk' : '#'} className="text-sm text-gray-500 hover:text-gray-900 transition">{l}</Link>
            ))}
            <Link href="/permintaan-penawaran" className="rounded-full bg-gray-900 px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition">Mulai</Link>
          </div>
        </div>
      </nav>

      <div id="home-mega" ref={menuRef} role="menu"
        className={`fixed left-0 right-0 top-14 z-[9997] bg-white border-b border-gray-200 shadow-xl transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}>
        <div className="mx-auto max-w-5xl px-8">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6 max-h-[60vh] overflow-y-scroll"
            style={{ scrollbarWidth:'thin', scrollbarColor:'#d1d5db #f3f4f6', scrollbarGutter:'stable' }}>
            {CATEGORIES.map((cat: any) => (
              <div key={cat.id}>
                <Link href={`/kategori/${cat.slug}`} onClick={close}
                  className="mb-2 block text-sm font-semibold text-brand-700 hover:text-brand-800 transition" role="menuitem">{cat.name}</Link>
                {cat.children?.length > 0 && (
                  <ul className="space-y-1">
                    {cat.children.map((child: any) => (
                      <li key={child.id}>
                        <Link href={`/kategori/${child.slug}`} onClick={close}
                          className="block text-sm text-gray-600 hover:text-brand-700 transition py-0.5" role="menuitem">{child.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

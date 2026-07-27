'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/data/categories';

const CATEGORIES = categories.filter((c: any) => !c.parentId);

export function ProtoMegaMenu({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) close();
    };
    if (open) { document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }
  }, [open, close]);

  const btnClass = dark
    ? 'flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition bg-white/5'
    : 'flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition';

  const panelClass = dark
    ? 'bg-black/95 backdrop-blur-xl border-b border-white/10'
    : 'bg-white border-b border-gray-200';

  const catClass = dark ? 'text-green-400 hover:text-green-300' : 'text-brand-700 hover:text-brand-800';
  const childClass = dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-brand-700';
  const scrollColors = dark
    ? { scrollbarWidth: 'thin' as const, scrollbarColor: '#374151 #111827', scrollbarGutter: 'stable' as const }
    : { scrollbarWidth: 'thin' as const, scrollbarColor: '#d1d5db #f3f4f6', scrollbarGutter: 'stable' as const };

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(v => !v)}
        className={btnClass} aria-expanded={open} aria-controls="proto-mega" aria-haspopup="menu">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        Semua Kategori
      </button>

      <div id="proto-mega" ref={menuRef} role="menu"
        className={`absolute left-0 right-0 top-full z-[9997] shadow-xl transition-all duration-200 ${panelClass} ${
          open ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6 max-h-[60vh] overflow-y-scroll" style={scrollColors}>
            {CATEGORIES.map((cat: any) => (
              <div key={cat.id}>
                <Link href={`/kategori/${cat.slug}`} onClick={close} className={`mb-2 block text-sm font-semibold transition ${catClass}`} role="menuitem">{cat.name}</Link>
                {cat.children?.length > 0 && (
                  <ul className="space-y-1">
                    {cat.children.map((child: any) => (
                      <li key={child.id}>
                        <Link href={`/kategori/${child.slug}`} onClick={close} className={`block text-sm transition py-0.5 ${childClass}`} role="menuitem">{child.name}</Link>
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

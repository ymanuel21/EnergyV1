'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/data/categories';

const CATEGORIES = categories.filter((c: any) => !c.parentId);

export function PrototypeCMegaMenu() {
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

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition bg-white/5"
        aria-expanded={open} aria-controls="proto-c-mega" aria-haspopup="menu">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        Semua Kategori
      </button>

      <div id="proto-c-mega" ref={menuRef} role="menu"
        className={`absolute left-0 right-0 top-full z-[9997] border-b border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/50 transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0 visible pointer-events-auto' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6 max-h-[60vh] overflow-y-scroll"
            style={{ scrollbarWidth:'thin', scrollbarColor:'#374151 #111827', scrollbarGutter:'stable' }}>
            {CATEGORIES.map((cat: any) => (
              <div key={cat.id}>
                <Link href={`/kategori/${cat.slug}`} onClick={close}
                  className="mb-2 block text-sm font-semibold text-green-400 hover:text-green-300 transition" role="menuitem">{cat.name}</Link>
                {cat.children?.length > 0 && (
                  <ul className="space-y-1">
                    {cat.children.map((child: any) => (
                      <li key={child.id}>
                        <Link href={`/kategori/${child.slug}`} onClick={close}
                          className="block text-sm text-gray-500 hover:text-gray-300 transition py-0.5" role="menuitem">{child.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
        <style>{`
          #proto-c-mega div[style*="scrollbarWidth"]::-webkit-scrollbar { width: 6px; }
          #proto-c-mega div[style*="scrollbarWidth"]::-webkit-scrollbar-track { background: #111827; border-radius: 3px; }
          #proto-c-mega div[style*="scrollbarWidth"]::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        `}</style>
      </div>
    </>
  );
}

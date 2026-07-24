'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { NAV_LINKS } from '@lib/constants';

export function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:inline-flex"
      >
        <HamburgerIcon className="h-5 w-5" />
        Semua Kategori
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          <ul className="py-1">
            {NAV_LINKS.categories.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

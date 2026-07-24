'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { getCategoryTree } from '@/lib/data/categories';
import type { Category } from '@/types/product';

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const categories = getCategoryTree();
  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [close]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="hidden shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:inline-flex"
        aria-expanded={open}
        aria-controls="mega-menu"
        aria-haspopup="menu"
      >
        <HamburgerIcon className="h-5 w-5" />
        Semua Kategori
      </button>

      {/* Mega menu: rendered outside the flex flow, positioned relative to header */}
      <div
        id="mega-menu"
        ref={menuRef}
        role="menu"
        className={`absolute left-0 right-0 top-full z-[9997] bg-white border-b border-gray-200 shadow-xl transition-all duration-200 ${
          open
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6 max-h-[60vh] overflow-y-auto">
            {categories.map((cat) => (
              <CategoryColumn key={cat.id} category={cat} onClick={close} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CategoryColumn({ category, onClick }: { category: Category; onClick: () => void }) {
  return (
    <div>
      <Link
        href={`/kategori/${category.slug}`}
        onClick={onClick}
        className="mb-2 block text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors"
        role="menuitem"
      >
        {category.name}
      </Link>

      {category.children && category.children.length > 0 && (
        <ul className="space-y-1">
          {category.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/kategori/${child.slug}`}
                onClick={onClick}
                className="block text-sm text-gray-600 hover:text-brand-700 transition-colors py-0.5"
                role="menuitem"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

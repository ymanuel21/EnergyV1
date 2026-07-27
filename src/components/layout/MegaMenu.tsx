'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { categories as defaultCategories } from '@/lib/data/categories';
import type { Category } from '@/types/product';

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.length) {
          setCategories(data.filter((c: any) => !c.parentId));
        }
      })
      .catch(() => {});
  }, []);

  // Check overflow and scroll position
  useEffect(() => {
    function check() {
      if (scrollRef.current) {
        const el = scrollRef.current;
        const overflow = el.scrollHeight > el.clientHeight;
        setHasOverflow(overflow);
        if (overflow) {
          setScrolledToBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 20);
        }
      }
    }
    if (open) {
      requestAnimationFrame(check);
      scrollRef.current?.addEventListener('scroll', check);
    }
    return () => scrollRef.current?.removeEventListener('scroll', check);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [close]);

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
          <div className="relative">
            {/* Scrollable grid — overflow-y-scroll forces visible scrollbar */}
            <div
              ref={scrollRef}
              className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6 max-h-[60vh] overflow-y-scroll"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6',
                scrollbarGutter: 'stable',
              }}
            >
              {categories.map((cat) => (
                <CategoryColumn key={cat.id} category={cat} onClick={close} />
              ))}
            </div>

            {/* Gradient fade at bottom — visible when overflow exists and not scrolled to bottom */}
            {hasOverflow && !scrolledToBottom && (
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
                style={{
                  background: 'linear-gradient(to bottom, transparent, white)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Cross-browser scrollbar styling */}
        <style>{`
          #mega-menu div[style*="scrollbarWidth"]::-webkit-scrollbar {
            width: 8px;
          }
          #mega-menu div[style*="scrollbarWidth"]::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 4px;
          }
          #mega-menu div[style*="scrollbarWidth"]::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          #mega-menu div[style*="scrollbarWidth"]::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>
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
        className="mb-2 block text-sm font-semibold text-gray-900 hover:text-gray-800 transition-colors"
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
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors py-0.5"
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

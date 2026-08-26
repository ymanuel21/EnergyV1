'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { HamburgerIcon } from '@ui/Icons';
import { categories as defaultCategories } from '@/lib/data/categories';
import { brandRepo } from '@/lib/repositories/brand';
import { featureFlags } from '@/lib/platform';
import type { Category } from '@/types/product';

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [popularBrands, setPopularBrands] = useState<{ id: string; name: string; slug: string; productCount: number }[]>([]);
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => {
        if (data.length) {
          setCategories(data.filter((c: any) => !c.parentId));
        }
      })
      .catch(() => {});

    fetch('/api/brands?popular=6')
      .then(r => r.json())
      .then(data => setPopularBrands(data))
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

  // Group categories by color — the color is a data-driven grouping key that
  // determines where horizontal separators (border-t border-border) appear.
  // The actual color values are NOT hardcoded or checked; consecutive
  // categories with the same color belong to the same group.
  const visibleCategories = categories.filter((cat) =>
    featureFlags.isEnabled('showBrandCategoryInMegaMenu') || cat.slug !== 'brand'
  );
  const groups: Category[][] = [];
  let curGroup: Category[] = [];
  let curColor: string | null = null;
  for (const cat of visibleCategories) {
    const c = cat.color ?? null;
    if (c !== curColor) {
      if (curGroup.length) groups.push(curGroup);
      curGroup = [cat];
      curColor = c;
    } else {
      curGroup.push(cat);
    }
  }
  if (curGroup.length) groups.push(curGroup);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="hidden shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-surface transition-colors lg:inline-flex"
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
        className={`absolute left-0 right-0 top-full z-[9997] bg-card border-b border-border shadow-xl transition-all duration-200 ${
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
              className="max-h-[60vh] overflow-y-scroll"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f3f4f6',
                scrollbarGutter: 'stable',
              }}
            >
              {groups.map((group, gi) => (
                <div
                  key={gi}
                  className={`${gi > 0 ? 'border-t border-border' : ''}`}
                >
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4 py-6">
                    {group.map((cat) => (
                      <CategoryColumn key={cat.id} category={cat} onClick={close} />
                    ))}
                  </div>
                </div>
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

          {/* Popular Brands */}
          {popularBrands.length > 0 && (
            <div className="border-t border-border px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Brand</p>
                <Link href="/brand" onClick={close} className="text-xs font-medium text-primary hover:text-primary-hover transition">
                  View All Brands →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularBrands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/brand/${b.slug}`}
                    onClick={close}
                    className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-primary hover:bg-surface hover:border-primary/30 transition"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
  const color = category.color;
  return (
    <div>
      <Link
        href={`/kategori/${category.slug}`}
        onClick={onClick}
        className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        role="menuitem"
      >
        {color ? (
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ) : null}
        <span>{category.name}</span>
      </Link>

      {category.children && category.children.length > 0 && (
        <ul className="space-y-1">
          {category.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/kategori/${child.slug}`}
                onClick={onClick}
                className="block text-sm text-muted hover:text-primary transition-colors py-0.5"
                role="menuitem"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {category.showGradient ? (
        <div
          aria-hidden="true"
          className="mt-2"
          style={{
            height: `${category.gradientHeight ?? 48}px`,
            background: `linear-gradient(to bottom, transparent, ${category.gradientColor ?? '#FFFFFF'})`,
          }}
        />
      ) : null}
    </div>
  );
}

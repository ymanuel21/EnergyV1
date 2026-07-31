'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LinkedProduct {
  slug: string;
  name: string;
}

export function ProductAccordion({ products }: { products: LinkedProduct[] }) {
  const [open, setOpen] = useState(false);
  const count = products.length;

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-2">
      {/* Header — always visible, clickable */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v); } }}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
        aria-controls="product-accordion-body"
      >
        <div>
          <h3 className="text-sm font-semibold text-primary">Produk Digunakan</h3>
          <p className="text-xs text-muted">
            {count > 0 ? `${count} produk terkait` : 'Belum ada produk terkait'}
          </p>
        </div>
        {count > 0 && (
          <svg
            className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Body — animated expand/collapse */}
      <div
        id="product-accordion-body"
        role="region"
        className={`grid transition-all duration-250 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          {count > 0 ? (
            <>
              <div className="my-3 border-t border-border" />
              <ul className="space-y-2">
                {products.map(p => (
                  <li key={p.slug}>
                    <Link
                      href={`/produk/${p.slug}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-surface transition-colors group"
                    >
                      <span className="text-primary group-hover:text-primary-hover">{p.name}</span>
                      <svg className="h-3.5 w-3.5 shrink-0 text-muted group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-border pt-2">
                <p className="text-xs text-muted leading-relaxed">
                  Semua produk di atas akan otomatis dimasukkan ketika memilih <strong>&quot;Minta Penawaran Serupa&quot;</strong>.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

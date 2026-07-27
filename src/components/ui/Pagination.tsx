'use client';

import Link from 'next/link';
import { cn } from '@lib/utils/cn';

export interface PaginationProps {
  current: number;
  total: number;
  /** Base URL path, e.g. '/kategori/panel-surya' or '/cari' */
  baseUrl: string;
  /** Query parameters to preserve across pages (excluding 'page') */
  params?: Record<string, string>;
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildHref(baseUrl: string, params: Record<string, string>, page: number): string {
  const searchParams = new URLSearchParams(params);
  searchParams.set('page', String(page));
  const qs = searchParams.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

export function Pagination({
  current,
  total,
  baseUrl,
  params = {},
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (total <= 1) return null;

  const totalPages = Math.max(1, total);
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, totalPages);

  if (leftSibling > 2) {
    pages.push(1);
    pages.push('ellipsis-start');
  } else {
    pages.push(...range(1, Math.min(leftSibling, totalPages)));
  }

  for (let i = Math.max(leftSibling, 2); i <= Math.min(rightSibling, totalPages - 1); i++) {
    if (i > 1 && i < totalPages) pages.push(i);
  }

  if (rightSibling < totalPages - 1) {
    pages.push('ellipsis-end');
    pages.push(totalPages);
  } else if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      <Link
        href={current > 1 ? buildHref(baseUrl, params, current - 1) : '#'}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          current <= 1
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-disabled={current <= 1}
        tabIndex={current <= 1 ? -1 : undefined}
      >
        ← Sebelumnya
      </Link>

      {pages.map((page, i) => {
        if (typeof page === 'string') {
          return (
            <span key={page + i} className="px-2 py-2 text-sm text-gray-400">
              …
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={buildHref(baseUrl, params, page)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              page === current
                ? 'bg-gray-800 text-white pointer-events-none'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
            aria-current={page === current ? 'page' : undefined}
          >
            {page}
          </Link>
        );
      })}

      <Link
        href={current < totalPages ? buildHref(baseUrl, params, current + 1) : '#'}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          current >= totalPages
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-disabled={current >= totalPages}
        tabIndex={current >= totalPages ? -1 : undefined}
      >
        Selanjutnya →
      </Link>
    </nav>
  );
}

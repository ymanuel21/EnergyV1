'use client';

import Link, { useLinkStatus } from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

// ═══ Pending state ═══
// Derived exclusively from useLinkStatus(), which reports whether the enclosing
// <Link> has a navigation in flight. No timers and no hand-managed lock: when the
// navigation completes or is cancelled the flag clears and controls restore themselves.

type RegisterPending = (id: string, label: string) => () => void;

const RegisterPendingContext = createContext<RegisterPending | null>(null);
const PendingContext = createContext<{ pending: boolean; label: string | null }>({
  pending: false,
  label: null,
});

function PendingProvider({ children }: { children: ReactNode }) {
  const [pendingByLink, setPendingByLink] = useState<Record<string, string>>({});

  const register = useCallback<RegisterPending>((id, label) => {
    setPendingByLink((prev) => (prev[id] === label ? prev : { ...prev, [id]: label }));
    return () => {
      setPendingByLink((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };
  }, []);

  const value = useMemo(() => {
    const labels = Object.values(pendingByLink);
    return {
      pending: labels.length > 0,
      label: labels.length > 0 ? labels[labels.length - 1] : null,
    };
  }, [pendingByLink]);

  return (
    <RegisterPendingContext.Provider value={register}>
      <PendingContext.Provider value={value}>{children}</PendingContext.Provider>
    </RegisterPendingContext.Provider>
  );
}

/** Spinner + registration. Must be rendered inside the <Link> it observes. */
function PendingIndicator({ id, label }: { id: string; label: string }) {
  const { pending } = useLinkStatus();
  const register = useContext(RegisterPendingContext);

  useEffect(() => {
    if (!pending || !register) return;
    return register(id, label);
  }, [pending, id, label, register]);

  if (!pending) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      fill="none"
      className="mr-1 inline-block h-3 w-3 animate-spin motion-reduce:animate-none"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface PaginationLinkProps {
  href: string;
  className: string;
  /** Spoken destination, e.g. "halaman 2 dari 19" */
  label: string;
  /** Boundary control that cannot be followed */
  disabled?: boolean;
  isCurrent?: boolean;
  children: ReactNode;
}

function PaginationLink({
  href,
  className,
  label,
  disabled = false,
  isCurrent = false,
  children,
}: PaginationLinkProps) {
  const { pending } = useContext(PendingContext);
  const blocked = pending || disabled;

  return (
    <Link
      href={href}
      className={cn(className, pending && 'pointer-events-none opacity-60')}
      aria-current={isCurrent ? 'page' : undefined}
      aria-disabled={blocked || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={pending ? (event) => event.preventDefault() : undefined}
    >
      {!disabled && <PendingIndicator id={href} label={label} />}
      {children}
    </Link>
  );
}

function PaginationNav({ current, total, baseUrl, params = {}, siblingCount = 1, className }: PaginationProps) {
  const { pending, label } = useContext(PendingContext);

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

  const middleStart = leftSibling > 2 ? leftSibling : leftSibling + 1;
  for (let i = middleStart; i <= Math.min(rightSibling, totalPages - 1); i++) {
    if (i > 1 && i < totalPages) pages.push(i);
  }

  if (rightSibling < totalPages - 1) {
    pages.push('ellipsis-end');
    pages.push(totalPages);
  } else if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
      aria-busy={pending || undefined}
    >
      <span role="status" aria-live="polite" className="sr-only">
        {pending && label ? `Memuat ${label}` : ''}
      </span>

      <PaginationLink
        href={current > 1 ? buildHref(baseUrl, params, current - 1) : '#'}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          current <= 1
            ? 'pointer-events-none text-gray-300'
            : 'text-muted hover:text-primary hover:bg-surface'
        }`}
        label={`halaman ${Math.max(1, current - 1)} dari ${totalPages}`}
        disabled={current <= 1}
      >
        ← Sebelumnya
      </PaginationLink>

      {pages.map((page, i) => {
        if (typeof page === 'string') {
          return (
            <span key={page + i} className="px-2 py-2 text-sm text-muted">
              …
            </span>
          );
        }

        return (
          <PaginationLink
            key={page}
            href={buildHref(baseUrl, params, page)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              page === current
                ? 'bg-primary text-white pointer-events-none'
                : 'text-muted hover:text-primary hover:bg-surface'
            )}
            label={`halaman ${page} dari ${totalPages}`}
            isCurrent={page === current}
          >
            {page}
          </PaginationLink>
        );
      })}

      <PaginationLink
        href={current < totalPages ? buildHref(baseUrl, params, current + 1) : '#'}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          current >= totalPages
            ? 'pointer-events-none text-gray-300'
            : 'text-muted hover:text-primary hover:bg-surface'
        }`}
        label={`halaman ${Math.min(totalPages, current + 1)} dari ${totalPages}`}
        disabled={current >= totalPages}
      >
        Selanjutnya →
      </PaginationLink>
    </nav>
  );
}

export function Pagination(props: PaginationProps) {
  if (props.total <= 1) return null;

  return (
    <PendingProvider>
      <PaginationNav {...props} />
    </PendingProvider>
  );
}

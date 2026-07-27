'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@lib/utils/cn';

export interface SortDropdownProps {
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Paling Relevan' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'bestseller', label: 'Paling Laris' },
  { value: 'most-viewed', label: 'Paling Dilihat' },
  { value: 'biggest-discount', label: 'Diskon Terbesar' },
];

export function SortDropdown({ className }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? 'price-asc';

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label className="text-sm text-gray-600">Urutkan</label>
      <select
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

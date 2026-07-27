'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <label htmlFor="header-search" className="sr-only">
        Cari produk
      </label>
      <input
        id="header-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari produk"
        className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-12 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none transition-colors"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-gray-800 p-1.5 text-white hover:bg-gray-900 transition-colors"
        aria-label="Cari"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}

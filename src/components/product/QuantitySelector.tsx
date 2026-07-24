'use client';

import { useState } from 'react';
import { cn } from '@lib/utils/cn';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  className,
}: QuantitySelectorProps) {
  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < max) onChange(value + 1);
  }

  return (
    <div className={cn('inline-flex items-center rounded-lg border border-gray-300', className)}>
      <button
        onClick={decrement}
        disabled={value <= min}
        className="px-3 py-2 text-gray-600 hover:text-brand-700 disabled:opacity-30 transition-colors"
        aria-label="Kurangi jumlah"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <button
        onClick={increment}
        disabled={value >= max}
        className="px-3 py-2 text-gray-600 hover:text-brand-700 disabled:opacity-30 transition-colors"
        aria-label="Tambah jumlah"
      >
        +
      </button>
    </div>
  );
}

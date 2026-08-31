'use client';

import { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps {
  name: string;
  label?: string;
  required?: boolean;
  defaultValue?: number;
  placeholder?: string;
  className?: string;
  /** Called with the parsed integer value whenever the currency changes. */
  onChange?: (value: number) => void;
}

function formatRupiah(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('id-ID');
}

function parseRupiah(formatted: string): number {
  // Strip all non-digit characters
  const digits = formatted.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

export function CurrencyInput({
  name,
  label,
  required,
  defaultValue,
  placeholder = '0',
  className = '',
  onChange,
}: CurrencyInputProps) {
  const displayValue = defaultValue ? formatRupiah(defaultValue) : '';
  const [formatted, setFormatted] = useState(displayValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number>(0);

  // Reset when defaultValue changes externally
  useEffect(() => {
    if (defaultValue !== undefined) {
      setFormatted(formatRupiah(defaultValue));
    }
  }, [defaultValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Remove any non-digit chars to get raw number
    const digits = raw.replace(/\D/g, '');
    const numeric = parseInt(digits, 10) || 0;

    // Track cursor position before formatting
    cursorRef.current = e.target.selectionStart || 0;

    // Format with separators
    const formatted = numeric === 0 ? '' : formatRupiah(numeric);

    // Notify parent of the parsed numeric value (not the formatted string).
    onChange?.(numeric);

    // Count separators before cursor to adjust position
    const sepBefore = (raw.substring(0, cursorRef.current).match(/\./g) || []).length;
    const sepAfter = (formatted.substring(0, cursorRef.current).match(/\./g) || []).length;
    const adjustment = sepAfter - sepBefore;

    setFormatted(formatted);

    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = Math.min(cursorRef.current + adjustment, formatted.length);
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        name={name}
        type="text"
        inputMode="numeric"
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums"
      />
      {/* Hidden input submits raw numeric value to server */}
      <input type="hidden" name={name} value={parseRupiah(formatted)} />
    </div>
  );
}

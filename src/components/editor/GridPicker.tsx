'use client';

import { useState } from 'react';

interface GridPickerProps {
  onSelect: (rows: number, cols: number) => void;
  maxRows?: number;
  maxCols?: number;
}

export function GridPicker({ onSelect, maxRows = 8, maxCols = 8 }: GridPickerProps) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button type="button" onClick={() => setOpen(!open)}
        className="rounded border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface hover:text-primary transition">
        ⊞ Table
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-border bg-card shadow-xl p-3"
          onMouseLeave={() => setOpen(false)}>
          <div className="text-xs text-muted mb-2 text-center">
            {hover.r > 0 && hover.c > 0 ? `${hover.r} × ${hover.c}` : 'Select size'}
          </div>
          <div
            onMouseLeave={() => setHover({ r: 0, c: 0 })}
            style={{ display: 'grid', gap: '2px', gridTemplateColumns: `repeat(${maxCols}, 20px)` }}
          >
            {Array.from({ length: maxRows }, (_, r) =>
              Array.from({ length: maxCols }, (_, c) => {
                const active = r < hover.r && c < hover.c;
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                    onClick={() => { onSelect(hover.r, hover.c); setOpen(false); }}
                    className={`h-5 w-5 rounded-sm cursor-pointer border transition-colors ${
                      active ? 'bg-primary border-primary' : 'bg-surface border-border'
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

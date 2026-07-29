'use client';

import { useState } from 'react';
import { ImportModal } from './ImportModal';

export function ProductActions() {
  const [showImport, setShowImport] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <a
          href="/api/admin/products/export"
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition"
        >
          Export CSV
        </a>
        <button
          onClick={() => setShowImport(true)}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition"
        >
          Import CSV
        </button>
      </div>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </>
  );
}

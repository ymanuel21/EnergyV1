'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { sheet: string; row: number; column: string; message: string }[];
}

export function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'importing' | 'done'>('upload');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState('sync');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setError('Please upload a .xlsx Excel file.');
      return;
    }
    setStep('importing');
    setError(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('mode', mode);

    try {
      const res = await fetch('/api/admin/products/import-xlsx', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setStep('done');
        router.refresh();
      } else {
        setError(data.error || 'Import failed');
        setStep('upload');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
      setStep('upload');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Import Excel (.xlsx)</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-lg leading-none">&times;</button>
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted">Import Mode:</label>
              <select value={mode} onChange={e => setMode(e.target.value)}
                className="rounded border border-border px-2 py-1.5 text-sm bg-card">
                <option value="sync">🔄 Smart Sync (Create + Update)</option>
                <option value="create">➕ Create Only</option>
                <option value="update">✏️ Update Only</option>
              </select>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <p className="text-3xl mb-3">📊</p>
              <p className="text-muted mb-2">Upload Excel workbook (.xlsx)</p>
              <p className="text-xs text-muted mb-4">Export first to get the correct format</p>
              <button onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                Choose File
              </button>
              <input ref={fileRef} type="file" accept=".xlsx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            <div className="text-center">
              <a href="/api/admin/products/export-xlsx" className="text-sm text-primary hover:underline">
                📥 Download template (Export current products)
              </a>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {step === 'importing' && (
          <div className="py-12 text-center">
            <p className="text-muted animate-pulse">📊 Importing products...</p>
          </div>
        )}

        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{result.created}</div>
                  <div className="text-xs text-green-600">Created</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{result.updated}</div>
                  <div className="text-xs text-blue-600">Updated</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <div className="text-2xl font-bold text-amber-700">{result.skipped}</div>
                  <div className="text-xs text-amber-600">Skipped</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-auto border-t border-border pt-3">
                  <p className="text-xs font-medium text-red-600 mb-2">{result.errors.length} error(s):</p>
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-xs text-red-600 py-0.5">
                      [{e.sheet}] Row {e.row}: <span className="font-mono">{e.column && `${e.column} — `}{e.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

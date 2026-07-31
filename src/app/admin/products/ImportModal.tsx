'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState('sync');
  const [dragOver, setDragOver] = useState(false);
  const fileRef2 = useRef<File | null>(null);

  const handleFile = async (file: File, isPreview: boolean) => {
    if (!file.name.endsWith('.xlsx')) { setError('Please upload a .xlsx Excel file.'); return; }
    fileRef2.current = file;
    setError(null);
    setStep('preview');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('mode', mode);
    fd.append('preview', 'true');

    try {
      const res = await fetch('/api/admin/products/import-xlsx', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.validationFailed || res.status === 422) {
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || 'Preview failed');
      setStep('upload');
    }
  };

  const handleImport = async () => {
    if (!fileRef2.current) return;
    setStep('importing');
    const fd = new FormData();
    fd.append('file', fileRef2.current);
    fd.append('mode', mode);
    fd.append('preview', 'false');

    try {
      const res = await fetch('/api/admin/products/import-xlsx', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
      setStep('done');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Import failed');
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">
            {step === 'upload' && 'Import Excel (.xlsx)'}
            {step === 'preview' && 'Preview Import'}
            {step === 'importing' && 'Importing...'}
            {step === 'done' && 'Import Complete'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-lg leading-none">&times;</button>
        </div>

        {/* Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted">Mode:</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="rounded border border-border px-2 py-1.5 text-sm bg-card">
                <option value="sync">🔄 Smart Sync (Create + Update)</option>
                <option value="create">➕ Create Only</option>
                <option value="update">✏️ Update Only</option>
              </select>
            </div>
            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f, true); }}>
              <p className="text-3xl mb-3">📊</p>
              <p className="text-muted mb-2">Upload Excel workbook (.xlsx)</p>
              <p className="text-xs text-muted mb-4">Export first to get the correct format</p>
              <button onClick={() => fileRef.current?.click()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Choose File</button>
              <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f, true); }} />
            </div>
            <div className="text-center">
              <a href="/api/admin/products/export-xlsx" className="text-sm text-primary hover:underline">📥 Download template (Export current products)</a>
            </div>
          </div>
        )}

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Preview */}
        {step === 'preview' && result && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-3">Review changes before importing:</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="rounded-lg bg-surface p-3 text-center">
                  <div className="text-xl font-bold text-primary">{result.total || 0}</div>
                  <div className="text-xs text-muted">Total</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-xl font-bold text-green-700">{result.create || 0}</div>
                  <div className="text-xs text-green-600">Create</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-xl font-bold text-blue-700">{result.update || 0}</div>
                  <div className="text-xs text-blue-600">Update</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <div className="text-xl font-bold text-amber-700">{result.skip || 0}</div>
                  <div className="text-xs text-amber-600">Skip</div>
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div className="max-h-36 overflow-auto border-t border-border pt-3">
                  <p className="text-xs font-medium text-red-600 mb-2">{result.errors.length} validation error(s):</p>
                  {result.errors.map((e: any, i: number) => (
                    <div key={i} className="text-xs text-red-600 py-0.5">
                      [{e.sheet}] Row {e.row}: {e.column && `${e.column} — `}{e.message}
                    </div>
                  ))}
                </div>
              )}
              {result.errors?.length > 0 ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                  ⚠️ Please fix errors above before importing.
                </div>
              ) : null}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setStep('upload'); setResult(null); }} className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface">Cancel</button>
              <button onClick={handleImport} disabled={result.errors?.length > 0} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
                Import {result.total || 0} Products
              </button>
            </div>
          </div>
        )}

        {/* Importing */}
        {step === 'importing' && (
          <div className="py-12 text-center"><p className="text-muted animate-pulse">📊 Importing products...</p></div>
        )}

        {/* Done */}
        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{result.created || 0}</div>
                  <div className="text-xs text-green-600">Created</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-700">{result.updated || 0}</div>
                  <div className="text-xs text-blue-600">Updated</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <div className="text-2xl font-bold text-amber-700">{result.skipped || 0}</div>
                  <div className="text-xs text-amber-600">Skipped</div>
                </div>
              </div>
              {result.duration && <p className="text-xs text-muted">Duration: {result.duration} | File: {result.fileName} | Mode: {result.mode}</p>}
              {result.errors?.length > 0 && (
                <div className="max-h-48 overflow-auto border-t border-border pt-3 mt-3">
                  {result.errors.map((e: any, i: number) => (
                    <div key={i} className="text-xs text-red-600 py-0.5">[{e.sheet}] Row {e.row}: {e.column && `${e.column} — `}{e.message}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';

const PRODUCT_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: 'name', label: 'Product Name', required: true },
  { key: 'slug', label: 'Slug', required: true },
  { key: 'sku', label: 'SKU' },
  { key: 'price', label: 'Price' },
  { key: 'originalPrice', label: 'Original Price' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'specifications', label: 'Specifications (JSON)' },
  { key: 'downloads', label: 'Downloads (JSON)' },
];

type Step = 'upload' | 'map' | 'preview' | 'importing' | 'done';

interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: Papa.ParseError[];
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

export function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setParseError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          setParseError(results.errors.map(e => `Row ${e.row}: ${e.message}`).join('; '));
          return;
        }
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        setParseResult({ headers, rows, errors: results.errors });

        // Auto-map: try to match headers to fields
        const autoMap: Record<string, string> = {};
        for (const h of headers) {
          const hLower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = PRODUCT_FIELDS.find(f =>
            f.key.toLowerCase() === hLower ||
            f.label.toLowerCase().replace(/[^a-z0-9]/g, '') === hLower
          );
          if (match) autoMap[h] = match.key;
        }
        setMapping(autoMap);
        setStep('map');
      },
      error(err) {
        setParseError(err.message);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  const handleImport = useCallback(async () => {
    if (!parseResult) return;
    setStep('importing');

    // Invert mapping: field → CSV column
    const fieldMapping: Record<string, string> = {};
    for (const [csvCol, field] of Object.entries(mapping)) {
      if (field) fieldMapping[field] = csvCol;
    }

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parseResult.rows.map((data, i) => ({ row: i + 1, data })),
          mapping: fieldMapping,
        }),
      });
      const result = await res.json();
      setImportResult(result);
      setStep('done');
    } catch (e: any) {
      setParseError(e.message || 'Import request failed');
      setStep('map');
    }
  }, [parseResult, mapping]);

  const hasRequired = mapping && Object.values(mapping).includes('name') && Object.values(mapping).includes('slug');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">
            {step === 'upload' && 'Import Products from CSV'}
            {step === 'map' && 'Map Columns'}
            {step === 'preview' && 'Preview Import'}
            {step === 'importing' && 'Importing...'}
            {step === 'done' && 'Import Complete'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-lg leading-none">&times;</button>
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <p className="text-muted mb-3">Drag & drop a CSV file here</p>
            <p className="text-xs text-muted mb-4">or</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Choose File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}

        {/* Error display */}
        {parseError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{parseError}</div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'map' && parseResult && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {parseResult.rows.length} rows found. Map CSV columns to product fields.
            </p>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left font-medium text-primary">CSV Column</th>
                    <th className="p-2 text-left font-medium text-primary">→ Product Field</th>
                    <th className="p-2 text-left font-medium text-primary">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.headers.map(h => (
                    <tr key={h} className="border-b border-border/50">
                      <td className="p-2 text-primary font-mono text-xs">{h}</td>
                      <td className="p-2">
                        <select
                          value={mapping[h] || ''}
                          onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                          className="w-full rounded border border-border px-2 py-1 text-xs bg-card"
                        >
                          <option value="">— Ignore —</option>
                          {PRODUCT_FIELDS.map(f => (
                            <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-muted text-xs truncate max-w-[200px]">
                        {parseResult.rows[0]?.[h] || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setParseResult(null); setStep('upload'); }}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface">
                Back
              </button>
              <button
                onClick={() => setStep('preview')}
                disabled={!hasRequired}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && parseResult && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {parseResult.rows.length} products ready to import as <strong>draft</strong>.
            </p>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 text-left font-medium text-primary">#</th>
                    {Object.values(mapping).filter(Boolean).map(f => (
                      <th key={f} className="p-2 text-left font-medium text-primary capitalize">{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="p-2 text-muted text-xs">{i + 1}</td>
                      {Object.values(mapping).filter(Boolean).map(f => {
                        const csvCol = Object.entries(mapping).find(([, v]) => v === f)?.[0];
                        return <td key={f} className="p-2 text-xs truncate max-w-[150px]">{csvCol ? row[csvCol] : ''}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parseResult.rows.length > 20 && (
                <p className="text-xs text-muted p-2">...and {parseResult.rows.length - 20} more rows</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep('map')}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface">
                Back
              </button>
              <button onClick={handleImport}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                Import {parseResult.rows.length} Products
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && (
          <div className="py-12 text-center">
            <p className="text-muted">Importing products...</p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 'done' && importResult && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex gap-4">
                <div className="rounded-lg bg-green-50 px-4 py-2 text-sm">
                  <span className="text-green-700 font-bold">{importResult.imported}</span>
                  <span className="text-green-600 ml-1">imported</span>
                </div>
                {importResult.skipped > 0 && (
                  <div className="rounded-lg bg-amber-50 px-4 py-2 text-sm">
                    <span className="text-amber-700 font-bold">{importResult.skipped}</span>
                    <span className="text-amber-600 ml-1">skipped</span>
                  </div>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-3 max-h-48 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-1 text-left text-xs font-medium text-muted">Row</th>
                        <th className="p-1 text-left text-xs font-medium text-muted">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((e, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="p-1 text-xs text-muted">{e.row}</td>
                          <td className="p-1 text-xs text-red-600">{e.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={onClose}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

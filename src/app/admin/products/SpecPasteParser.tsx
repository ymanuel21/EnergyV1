'use client';

import { useState } from 'react';
import {
  parseSpecifications, parsedToSpecRows, specRowsToText, summarizeParsed,
  type ParsedSpecCategory, type SpecRow,
} from '@lib/spec-parser';

interface SpecPasteParserProps {
  /** rows currently in the specification editor (used by "Copy as text" + the replace warning) */
  currentSpecs: SpecRow[];
  /** called only when the user clicks Apply — never automatic */
  onApply: (rows: SpecRow[]) => void;
}

const inputCls =
  'w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';

/**
 * Paste & Parse for product specifications.
 *
 * Flow: Paste → Parse → Preview (editable) → Apply → the normal Save button.
 * The parser is deterministic (no AI). Nothing is written to the database here: Apply only
 * fills the specification editor in this form; the user still has to press Save.
 */
export function SpecPasteParser({ currentSpecs, onApply }: SpecPasteParserProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedSpecCategory[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const existingCount = currentSpecs.filter((s) => (s.key ?? '').trim()).length;

  const runParse = () => {
    const result = parseSpecifications(text);
    setParsed(result);
    const s = summarizeParsed(result);
    setNotice(
      s.rows === 0
        ? 'Tidak ada baris spesifikasi yang terdeteksi. Periksa format: "Label: Value", dipisah baris kosong antar kategori.'
        : null,
    );
  };

  const patchRow = (ci: number, ri: number, field: 'label' | 'value', val: string) => {
    setParsed((prev) => prev && prev.map((c, i) => (i !== ci ? c : {
      ...c,
      specifications: c.specifications.map((s, j) => {
        if (j !== ri) return s;
        const next = { ...s, [field]: val };
        // a row stops being "needs review" once it has both parts
        if (field === 'value' && val.trim() !== '' && next.label.trim() !== '') delete next.needsReview;
        return next;
      }),
    })));
  };

  const patchCategory = (ci: number, val: string) => {
    setParsed((prev) => prev && prev.map((c, i) => (i !== ci ? c : { ...c, category: val })));
  };

  const removeRow = (ci: number, ri: number) => {
    setParsed((prev) => prev && prev.map((c, i) => (i !== ci ? c : {
      ...c, specifications: c.specifications.filter((_, j) => j !== ri),
    })));
  };

  const addRow = (ci: number) => {
    setParsed((prev) => prev && prev.map((c, i) => (i !== ci ? c : {
      ...c, specifications: [...c.specifications, { label: '', value: '' }],
    })));
  };

  const removeCategory = (ci: number) => {
    setParsed((prev) => prev && prev.filter((_, i) => i !== ci));
  };

  const closeAll = () => {
    setParsed(null);
    setNotice(null);
  };

  const apply = (mode: 'replace' | 'append') => {
    if (!parsed) return;
    const rows = parsedToSpecRows(parsed);
    const next = mode === 'append' ? [...currentSpecs, ...rows] : rows;
    onApply(next);
    setOpen(false);
    setParsed(null);
    setText('');
    setNotice(
      `${rows.length} baris dimasukkan ke editor (${mode === 'append' ? 'ditambahkan' : 'mengganti'}). ` +
      'Belum tersimpan — tekan Simpan untuk menyimpan perubahan.',
    );
  };

  const summary = parsed ? summarizeParsed(parsed) : null;

  return (
    <div className="mb-4 rounded-lg border border-border bg-surface/40">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div>
          <p className="text-xs font-medium text-primary">Paste &amp; Parse Spesifikasi</p>
          <p className="text-[10px] text-muted">
            Tempel teks spesifikasi (kategori + baris <code>Label: Value</code>), parse, lalu periksa sebelum diterapkan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existingCount > 0 && (
            <button type="button" onClick={() => { setOpen(true); setText(specRowsToText(currentSpecs)); setNotice(null); }}
              className="rounded border border-border px-2.5 py-1 text-[11px] text-muted hover:border-primary hover:text-primary transition">
              Salin spesifikasi saat ini sebagai teks
            </button>
          )}
          <button type="button" onClick={() => { setOpen((v) => !v); setNotice(null); }}
            className="rounded border border-primary px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary hover:text-white transition">
            {open ? 'Tutup' : 'Paste Spesifikasi'}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={'Daya & Tegangan\n\nDaya keluaran continue: 3.5 kW\nPeak output: 3.74 kW\n\nFitur Teknis\n\nKomunikasi: RS485'}
            className={`${inputCls} font-mono leading-relaxed`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={runParse} disabled={!text.trim()}
              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-40 transition">
              Parse Spesifikasi
            </button>
            {parsed && (
              <button type="button" onClick={closeAll}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary transition">
                Batal
              </button>
            )}
            {notice && <span className="text-[11px] text-muted">{notice}</span>}
          </div>

          {parsed && summary && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span className="font-medium text-primary">
                  {summary.categories} kategori · {summary.rows} baris
                </span>
                {summary.needsReview > 0 && (
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                    ⚠ {summary.needsReview} baris belum bisa dipisah menjadi Label: Value — isi Value atau hapus barisnya
                  </span>
                )}
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {parsed.map((cat, ci) => (
                  <div key={ci} className="rounded border border-border bg-card p-2.5">
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        value={cat.category ?? ''}
                        onChange={(e) => patchCategory(ci, e.target.value)}
                        placeholder="(tanpa kategori)"
                        className="w-full rounded border border-dashed border-border px-2 py-1 text-[11px] font-medium text-primary focus:border-primary outline-none"
                      />
                      <button type="button" onClick={() => removeCategory(ci)}
                        className="shrink-0 text-[11px] text-red-400 hover:text-red-600" title="Hapus kategori ini">
                        ✕
                      </button>
                    </div>

                    <div className="hidden sm:grid sm:grid-cols-12 gap-1.5 px-0.5 pb-1 text-[10px] font-medium uppercase text-muted">
                      <span className="col-span-5">Specification</span>
                      <span className="col-span-6">Value</span>
                    </div>

                    {cat.specifications.map((row, ri) => (
                      <div key={ri} className="mb-1.5 flex items-start gap-1.5">
                        <div className="flex-1 sm:grid sm:grid-cols-12 gap-1.5">
                          <input value={row.label} onChange={(e) => patchRow(ci, ri, 'label', e.target.value)}
                            placeholder="Label" className={`${inputCls} sm:col-span-5`} />
                          <input value={row.value} onChange={(e) => patchRow(ci, ri, 'value', e.target.value)}
                            placeholder={row.needsReview ? '⚠ belum ada value' : 'Value'}
                            className={`${inputCls} sm:col-span-6 ${row.needsReview ? 'border-amber-300 bg-amber-50/40' : ''}`} />
                        </div>
                        <button type="button" onClick={() => removeRow(ci, ri)}
                          className="shrink-0 pt-1.5 text-xs text-red-400 hover:text-red-600" title="Hapus baris">
                          ✕
                        </button>
                      </div>
                    ))}

                    <button type="button" onClick={() => addRow(ci)}
                      className="text-[11px] font-medium text-primary hover:underline">
                      + Tambah baris
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <button type="button" onClick={() => apply('replace')} disabled={summary.rows === 0}
                  className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-40 transition">
                  Apply ke Spesifikasi
                </button>
                {existingCount > 0 && (
                  <button type="button" onClick={() => apply('append')} disabled={summary.rows === 0}
                    className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary disabled:opacity-40 transition">
                    Tambahkan ke yang ada
                  </button>
                )}
                <button type="button" onClick={closeAll}
                  className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:border-primary hover:text-primary transition">
                  Batal
                </button>
                <span className="text-[10px] text-muted">
                  {existingCount > 0
                    ? `Editor saat ini berisi ${existingCount} baris — "Apply" akan menggantinya. Belum tersimpan sampai Anda menekan Simpan.`
                    : 'Belum tersimpan sampai Anda menekan Simpan.'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

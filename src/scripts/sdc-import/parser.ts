// Isolated, reusable multi-band parser for the SDC catalog workbook.
//
// The "Harga SDC" sheet is NOT a single rectangular table: it is 5 side-by-side
// column "bands" (HUAWEI / DEYE / Jinko+Sungrow / Mounting / Sun Star Solar),
// each containing vertically stacked sections under a merged title row.
//
// This parser reconstructs those logical tables WITHOUT flattening the sheet.
// It is pure (no DB, no side effects) and deterministic (stable row order).

import type { Worksheet, Row } from 'exceljs';

export interface SdcSpec {
  label: string;
  value: string;
}

export interface SdcSourceRow {
  band: string;            // 'A' | 'B' | 'C' | 'D' | 'E'
  sectionTitle: string;    // e.g. "HUAWEI ON-GRID INVERTER (RESIDENTIAL)"
  brandName: string;
  brandSlug: string;
  model: string | null;    // source "Section"/"Code" value; null when "-"/blank
  description: string;
  specs: SdcSpec[];        // band E extra columns (Finishing/Material/Unit/Remarks)
  sourceRow: number;       // 1-based row in the sheet
}

interface BandDef {
  band: string;
  brandName: string;
  brandSlug: string | null; // null => derived from section title (band C)
  first: number;            // column of "No."
  code: number;             // column of "Section"/"Code"
  desc: number;             // column of "Description"
  specCols?: { label: string; col: number }[];
}

const BANDS: BandDef[] = [
  { band: 'A', brandName: 'HUAWEI', brandSlug: 'huawei', first: 1, code: 2, desc: 3 },
  { band: 'B', brandName: 'Deye', brandSlug: 'deye', first: 5, code: 6, desc: 7 },
  { band: 'C', brandName: '', brandSlug: null, first: 9, code: 10, desc: 11 },
  { band: 'D', brandName: 'Generic', brandSlug: 'generic', first: 13, code: 14, desc: 15 },
  {
    band: 'E', brandName: 'Sun Star Solar', brandSlug: 'sun-star-solar', first: 17, code: 18, desc: 19,
    specCols: [
      { label: 'Finishing', col: 20 },
      { label: 'Material', col: 21 },
      { label: 'Unit', col: 22 },
      { label: 'Remarks', col: 23 },
    ],
  },
];

// Band C hosts two vendors; brand is derived from the section title.
const C_BRANDS: Record<string, { name: string; slug: string }> = {
  'Jinko Module': { name: 'Jinko Solar', slug: 'jinko-solar' },
  'Sungrow On-grid Inverter': { name: 'Sungrow', slug: 'sungrow' },
  'Sungrow Hybrid Inverter': { name: 'Sungrow', slug: 'sungrow' },
};

const HEADER_RE = /^(No\.?|Section|Code|Description|Finishing|Material|Unit|Remarks)$/i;

interface CellLike {
  richText?: { text: string }[];
  text?: unknown;
  result?: unknown;
  hyperlink?: unknown;
}

function cellText(row: Row, col: number): string {
  const v = row.getCell(col).value;
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as unknown as CellLike;
    if (o.richText) return o.richText.map((r) => r.text).join('').trim();
    if (o.text != null) return String(o.text).trim();
    if (o.result !== undefined) return String(o.result).trim();
    return String(v).trim();
  }
  return String(v).trim();
}

export function parseSdcWorkbook(ws: Worksheet): SdcSourceRow[] {
  const merges: string[] = (ws.model as { merges?: string[] } | undefined)?.merges ?? [];
  const mergedRows = new Set<number>();
  for (const m of merges) {
    const mm = m.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (mm) {
      const r1 = +mm[2];
      const r2 = +mm[4];
      for (let r = r1; r <= r2; r++) mergedRows.add(r);
    }
  }

  const rows: SdcSourceRow[] = [];
  const maxRow = ws.rowCount; // use rowCount (the declared dimension is stale)

  for (const band of BANDS) {
    let brandName = band.brandName;
    let brandSlug = band.brandSlug;
    let sectionTitle = '';
    let headerSeen = false;

    for (let r = 1; r <= maxRow; r++) {
      const row = ws.getRow(r);
      const v1 = cellText(row, band.first);
      const vc = cellText(row, band.code);
      const vd = cellText(row, band.desc);

      const isTitle = !!v1 && !/^\d+$/.test(v1) && !HEADER_RE.test(v1) && mergedRows.has(r);
      const isHeader = /^No\.?$/i.test(v1) && !!vc;

      if (isTitle) {
        sectionTitle = v1;
        headerSeen = false;
        if (band.band === 'C') {
          const def = C_BRANDS[v1];
          brandName = def ? def.name : band.brandName;
          brandSlug = def ? def.slug : band.brandSlug;
        }
        continue;
      }
      if (isHeader) {
        headerSeen = true;
        continue;
      }
      if (!headerSeen) continue;

      if (!vc) continue; // blank code row is not a data row
      const model = vc === '-' ? null : vc;

      const specs: SdcSpec[] = [];
      if (band.specCols) {
        for (const sc of band.specCols) {
          const val = cellText(row, sc.col);
          if (val && val !== '-') specs.push({ label: sc.label, value: val });
        }
      }

      rows.push({
        band: band.band,
        sectionTitle,
        brandName,
        brandSlug: brandSlug || 'generic',
        model,
        description: vd,
        specs,
        sourceRow: r,
      });
    }
  }

  return rows;
}

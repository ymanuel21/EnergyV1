/**
 * Deterministic specification parser — plain text → structured categories + label/value rows.
 *
 * PURE: no React, no DB, no network, no AI. Same input always yields the same output.
 *
 * Recognises the convention our source data already uses:
 *
 *   Daya & Tegangan            ← category (isolated, colon-free, short line)
 *
 *   Daya keluaran continue: 3.5 kW (single module)   ← "label: value" rows
 *   • Peak output: 3.74 kW                           ← bullet-prefixed rows are accepted
 *
 * Rules (deliberately conservative — never guess, never drop text):
 *  - blank lines separate sections
 *  - rows split on the FIRST colon (':' or the full-width '：'); later colons stay in the value
 *  - the value is preserved verbatim (only outer whitespace is trimmed)
 *  - a bullet marker ('•', '-', '*', '–') at the start of a row is stripped, not stored
 *  - a line that cannot be split into label/value is KEPT and flagged `needsReview`
 */

export interface ParsedSpecRow {
  label: string;
  value: string;
  /** true = the parser could not split this into label/value; user must review it */
  needsReview?: boolean;
}

export interface ParsedSpecCategory {
  /** null = rows that appeared before any category heading */
  category: string | null;
  specifications: ParsedSpecRow[];
}

/** A specification row as stored in the existing Product.specifications JSON column. */
export interface SpecRow {
  key: string;
  value: string;
  /** optional grouping label (additive — existing rows have none and are unaffected) */
  category?: string;
}

const BULLET_RE = /^[•\-*–]\s+/;
const COLON_RE = /[:：]/;
const TERMINAL_PUNCT_RE = /[.!?]$/;
/** A category heading is a short label, not a sentence. */
const HEADING_MAX_LEN = 60;

const stripBullet = (line: string) => line.replace(BULLET_RE, '').trim();

/** Split a row on its FIRST colon. Returns null when there is no colon. */
export function splitSpecRow(line: string): { label: string; value: string } | null {
  const idx = line.search(COLON_RE);
  if (idx <= 0) return null;
  const label = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (!label) return null;
  return { label, value };
}

function isHeadingCandidate(line: string, prevBlank: boolean, isFirst: boolean, hasFollowing: boolean): boolean {
  if (!line) return false;
  if (COLON_RE.test(line)) return false;
  if (BULLET_RE.test(line)) return false;
  if (!prevBlank && !isFirst) return false;
  if (line.length > HEADING_MAX_LEN) return false;
  if (TERMINAL_PUNCT_RE.test(line)) return false;
  if (!hasFollowing) return false;
  return true;
}

/**
 * Parse pasted specification text into categories of label/value rows.
 */
export function parseSpecifications(text: string): ParsedSpecCategory[] {
  const normalized = (text ?? '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n').map((l) => l.trim());

  const categories: ParsedSpecCategory[] = [];
  let current: ParsedSpecCategory | null = null;
  let prevBlank = true;
  let sawContent = false;

  const ensureCategory = (): ParsedSpecCategory => {
    if (!current) {
      current = { category: null, specifications: [] };
      categories.push(current);
    }
    return current;
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    if (raw === '') {
      prevBlank = true;
      continue;
    }

    const isFirst = !sawContent;
    const hasFollowing = lines.slice(i + 1).some((l) => l !== '');

    // Category heading?
    if (isHeadingCandidate(raw, prevBlank, isFirst, hasFollowing)) {
      current = { category: raw, specifications: [] };
      categories.push(current);
      prevBlank = false;
      sawContent = true;
      continue;
    }

    const withoutBullet = BULLET_RE.test(raw) ? stripBullet(raw) : raw;
    const split = splitSpecRow(withoutBullet);

    if (split) {
      // A "label:" with nothing after it is kept but flagged for review.
      const row: ParsedSpecRow = split.value === ''
        ? { label: split.label, value: '', needsReview: true }
        : { label: split.label, value: split.value };
      ensureCategory().specifications.push(row);
    } else {
      // No colon. Decide between a value-only list item and a genuinely malformed line.
      const stripped = withoutBullet.trim();
      // Read the category BEFORE ensureCategory() may create one.
      const insideDetectedCategory = current !== null && current.category !== null;

      if (stripped === '' || /^[•\-*–\s]+$/.test(raw)) {
        // nothing but a bullet marker (or a line of markers) — no content at all.
        // Kept with its raw text so the user can see what was wrong; never dropped.
        ensureCategory().specifications.push({ label: raw, value: '', needsReview: true });
      } else if (stripped.startsWith(':')) {
        // ": value" — a value with no label at all
        ensureCategory().specifications.push({ label: '', value: stripped.replace(/^:\s*/, ''), needsReview: true });
      } else if (insideDetectedCategory) {
        // Inside a detected category these are list items that simply have no label
        // (e.g. the "Kesesuaian Sistem" compatibility sentences) -> value-only row.
        ensureCategory().specifications.push({ label: '', value: stripped });
      } else {
        // No category context, so it is impossible to tell label from value -> flag it.
        ensureCategory().specifications.push({ label: stripped, value: '', needsReview: true });
      }
    }

    prevBlank = false;
    sawContent = true;
  }

  // Drop a trailing empty category produced by a heading with no rows at all? No —
  // an empty category is meaningful (the user pasted a heading) and is kept, but a
  // category with no rows AND no name is noise.
  return categories.filter((c) => c.category !== null || c.specifications.length > 0);
}

/** Flatten parsed categories into the rows the admin editor stores. */
export function parsedToSpecRows(parsed: ParsedSpecCategory[]): SpecRow[] {
  const rows: SpecRow[] = [];
  for (const cat of parsed) {
    for (const spec of cat.specifications) {
      const row: SpecRow = { key: spec.label, value: spec.value };
      if (cat.category) row.category = cat.category;
      rows.push(row);
    }
  }
  return rows;
}

/**
 * Serialize existing specification rows back into the paste format (two-way round-trip:
 * structured specs → text → edit → paste & parse).
 */
export function specRowsToText(rows: SpecRow[] | undefined | null): string {
  if (!rows?.length) return '';
  const groups: { category: string | null; lines: string[] }[] = [];
  for (const row of rows) {
    const key = (row.key ?? '').trim();
    const value = (row.value ?? '').trim();
    if (!key && !value) continue;   // skip only fully empty rows (value-only rows are kept)
    const category = (row.category ?? '').trim() || null;
    const line = key ? (value ? `${key}: ${value}` : `${key}:`) : value;
    const last = groups[groups.length - 1];
    if (last && last.category === category) last.lines.push(line);
    else groups.push({ category, lines: [line] });
  }
  return groups
    .map((g) => (g.category ? `${g.category}\n\n${g.lines.join('\n')}` : g.lines.join('\n')))
    .join('\n\n');
}

/** Quick summary for the preview header. */
export function summarizeParsed(parsed: ParsedSpecCategory[]) {
  const rows = parsed.reduce((n, c) => n + c.specifications.length, 0);
  const needsReview = parsed.reduce((n, c) => n + c.specifications.filter((s) => s.needsReview).length, 0);
  return { categories: parsed.length, rows, needsReview };
}

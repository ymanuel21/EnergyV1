/**
 * English content overlay — applied on the PUBLIC read path only.
 *
 * Why this exists
 * ---------------
 * EBT Plaza's customer-facing content lives in a Neon Postgres database that also backs the
 * admin CMS. Translating it by writing to the database would mean (a) mutating production data
 * and (b) showing admin staff English text in edit forms, which they could then save back over
 * the Indonesian original.
 *
 * Instead the database is left exactly as it is. English values live in `en-db-content.ts` and
 * are merged over the rows on their way to public pages. Admin screens never call these helpers,
 * so they keep reading and writing the untouched Indonesian rows.
 *
 * Reversing this change = deleting `src/lib/i18n/` and the `applyEn*` calls. The database was
 * never modified, so reverting restores the original site exactly.
 *
 * Servers only: this module pulls in the full overlay dataset (~200 kB of copy), so it must
 * never be imported by a Client Component.
 */

import 'server-only';

import { EN_DB_CONTENT, EN_SPEC_TERMS, type EnTable, type RowPatch } from './en-db-content';

/**
 * Which row field identifies a row, per table.
 *
 * Slugs are tried before ids because the public read path always has the slug in hand and
 * slugs are what the translated content is keyed by. The id is kept as a fallback so a row
 * whose public projection happens to omit the slug still resolves.
 */
const KEY_FIELDS: Record<EnTable, string[]> = {
  products: ['slug', 'id'],
  categories: ['slug', 'id'],
  articles: ['slug', 'id'],
  faqs: ['id'],
  pages: ['slug', 'id'],
  projects: ['slug', 'id'],
  testimonials: ['id'],
  navigation_links: ['id'],
  homepage_sections: ['id'],
  settings: ['key'],
};

/** Find the patch that applies to a row, if any. */
function patchFor(table: EnTable, row: Record<string, unknown>): RowPatch | undefined {
  const tableMap = EN_DB_CONTENT[table] as Record<string, RowPatch>;
  for (const field of KEY_FIELDS[table]) {
    const key = row[field];
    // Numeric ids (faqs use an autoincrement id) are stringified so the overlay — which is
    // keyed by string JSON keys — still matches them.
    if (typeof key === 'string' || typeof key === 'number' || typeof key === 'bigint') {
      const patch = tableMap[String(key)];
      if (patch) return patch;
    }
  }
  return undefined;
}

/**
 * Translate a product's specification list.
 *
 * Rows come in three shapes from the CMS — `{category,key,value}`, `{key,value}` and
 * `{label,value}` — so each text field is mapped through the matching term dictionary.
 * Anything not in a dictionary passes through unchanged, which keeps numeric-only values,
 * model codes and already-English labels intact.
 */
export function applyEnSpecifications<T>(specs: T): T {
  if (!Array.isArray(specs)) return specs;
  return specs.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const row = item as Record<string, unknown>;
    const out: Record<string, unknown> = { ...row };
    if (typeof row.category === 'string') out.category = EN_SPEC_TERMS.categories[row.category] ?? row.category;
    if (typeof row.key === 'string') out.key = EN_SPEC_TERMS.keys[row.key] ?? row.key;
    if (typeof row.label === 'string') out.label = EN_SPEC_TERMS.keys[row.label] ?? row.label;
    if (typeof row.value === 'string') out.value = EN_SPEC_TERMS.values[row.value] ?? row.value;
    return out as T;
  }) as T;
}

/**
 * Overlay English content onto one database row.
 *
 * Rows whose key is absent from the overlay are returned unchanged, so a partial translation
 * degrades to "still Indonesian" rather than to a blank string.
 *
 * String patches replace a field only when the row already holds a string — this prevents a
 * translation from materialising a column the row never had. Object patches (JSON columns such
 * as a homepage section's `settings`) are merged onto the existing object so structural keys
 * (image paths, anchor ids, internal links, numbers) survive.
 *
 * Product specification arrays are translated through the shared spec vocabulary regardless of
 * whether the product has its own patch, because the vocabulary is normalised across products.
 */
export function applyEnRow<T extends Record<string, unknown>>(table: EnTable, row: T): T {
  const base = table === 'products' && 'specifications' in row
    ? ({ ...row, specifications: applyEnSpecifications(row.specifications) } as T)
    : row;

  const patch = patchFor(table, base);
  if (!patch) return base;

  const out: Record<string, unknown> = { ...base };
  for (const [field, value] of Object.entries(patch)) {
    const current = out[field];
    if (typeof value === 'string') {
      if (typeof current === 'string') out[field] = value;
      continue;
    }
    if (Array.isArray(value)) {
      // List columns (e.g. a project's `highlights`) are replaced wholesale.
      out[field] = value;
      continue;
    }
    if (value && typeof value === 'object') {
      out[field] =
        current && typeof current === 'object' && !Array.isArray(current)
          ? { ...(current as Record<string, unknown>), ...(value as Record<string, unknown>) }
          : value;
    }
  }
  return out as T;
}

/** Overlay English content onto a list of rows. */
export function applyEnRows<T extends Record<string, unknown>>(table: EnTable, rows: T[]): T[] {
  return rows.map((row) => applyEnRow(table, row));
}

/**
 * Type-preserving overlay for a single row of any shape.
 *
 * Prisma's model types are not assignable to `Record<string, unknown>` under a generic
 * constraint, so call sites that want to keep their row type use this instead of casting to
 * `any`.
 */
export function applyEn<T>(table: EnTable, row: T): T {
  return applyEnRow(table, row as unknown as Record<string, unknown>) as unknown as T;
}

/** Type-preserving overlay for a list of rows of any shape. */
export function applyEnList<T>(table: EnTable, rows: T[]): T[] {
  return rows.map((row) => applyEn(table, row));
}

/** Overlay a single free-standing string (for values fetched without their row key). */
export function applyEnText(value: string): string {
  return EN_DB_CONTENT.text[value] ?? value;
}

/**
 * Recursively translate free-standing strings inside an arbitrary JSON value.
 * Used for nested content blocks that are not addressable by row key.
 */
export function applyEnDeep<T>(value: T): T {
  if (typeof value === 'string') return applyEnText(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => applyEnDeep(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = applyEnDeep(v);
    return out as unknown as T;
  }
  return value;
}

/**
 * Type guard used by the localization test suite: does any overlay patch reference a row
 * that the caller believes exists? Exposed so tests can assert coverage explicitly.
 */
export function overlayKeys(table: EnTable): string[] {
  return Object.keys(EN_DB_CONTENT[table] as Record<string, unknown>);
}

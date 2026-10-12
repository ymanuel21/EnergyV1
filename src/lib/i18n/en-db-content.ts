/**
 * English content overlay — the data behind `apply-en.ts`.
 *
 * Everything here is keyed by the *database row identifier* (product slug, page slug,
 * category slug, row id, settings key). Nothing in this file is ever written back to
 * Postgres: the overlay is merged over rows on the public read path only.
 *
 * Two kinds of value live here:
 *
 *   • `products`, `categories`, … — a patch for each translated row. Only the fields
 *     present in a patch are replaced; a row with no patch passes through untouched.
 *     Fields whose value is an object (e.g. a homepage section's `settings` JSON) are
 *     merged onto the existing object, so structural keys such as image paths, anchor
 *     ids and internal links are never lost.
 *
 *   • `text` — a flat Indonesian → English dictionary for free-standing strings that
 *     are not attached to a row (currently empty; `applyEnDeep`/`applyEnText` use it).
 *
 * Read `../docs/i18n/TRANSLATION_BRIEF.md` for the term base and the rules the wording
 * follows.
 */

import 'server-only';

import productsEn from './data/products.en.json';
import contentEn from './data/content.en.json';
import specTermsEn from './data/spec-terms.en.json';

/** Tables whose public rows carry translated content. */
export type EnTable =
  | 'products'
  | 'categories'
  | 'articles'
  | 'faqs'
  | 'pages'
  | 'projects'
  | 'testimonials'
  | 'navigation_links'
  | 'homepage_sections'
  | 'settings';

/** A patch for a single row: field name → English value (string, or nested object). */
export type RowPatch = Record<string, unknown>;

/** The complete overlay. */
export interface EnOverlay {
  products: Record<string, RowPatch>;
  categories: Record<string, RowPatch>;
  articles: Record<string, RowPatch>;
  faqs: Record<string, RowPatch>;
  pages: Record<string, RowPatch>;
  projects: Record<string, RowPatch>;
  testimonials: Record<string, RowPatch>;
  navigation_links: Record<string, RowPatch>;
  homepage_sections: Record<string, RowPatch>;
  settings: Record<string, RowPatch>;
  /** Free-standing string dictionary. */
  text: Record<string, string>;
}

const content = contentEn as unknown as Partial<EnOverlay>;
const specTerms = specTermsEn as unknown as {
  categories?: Record<string, string>;
  keys?: Record<string, string>;
  values?: Record<string, string>;
};

/**
 * Product specification vocabulary.
 *
 * Specification tables are a normalised structure — `{ category, key, label, value }` — and the
 * same headings and values repeat across hundreds of products ("Cooling", "Operating Temperature",
 * "120 V to 750 VDC"). Translating the ~300 distinct strings once, here, covers 3,000+ spec rows
 * without duplicating them per product.
 */
export const EN_SPEC_TERMS = {
  categories: specTerms.categories ?? {},
  keys: specTerms.keys ?? {},
  values: specTerms.values ?? {},
};

export const EN_DB_CONTENT: EnOverlay = {
  products: productsEn as unknown as Record<string, RowPatch>,
  categories: content.categories ?? {},
  articles: content.articles ?? {},
  faqs: content.faqs ?? {},
  pages: content.pages ?? {},
  projects: content.projects ?? {},
  testimonials: content.testimonials ?? {},
  navigation_links: content.navigation_links ?? {},
  homepage_sections: content.homepage_sections ?? {},
  settings: content.settings ?? {},
  text: content.text ?? {},
};

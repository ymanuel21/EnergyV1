/**
 * Server-side locale helpers.
 *
 * The locale itself is owned by next-intl (`src/i18n/request.ts`, cookie-based). This module adds
 * the pieces the content layer needs: locale-aware database overlays and language-scoped cache
 * keys.
 *
 * Content strategy (see docs/i18n/IMPLEMENTATION.md)
 * --------------------------------------------------
 * UI wording lives in `messages/*.json` and is rendered through next-intl keys. Business content
 * (products, specifications, articles, projects, pages, settings) lives in the CMS database and is
 * NOT duplicated here: English values are stored as translation records keyed by the row's stable
 * id/slug in `en-db-content.ts`, and merged over the untouched Indonesian row for English visitors
 * only. The database is never written to.
 */

import 'server-only';

import { getLocale } from 'next-intl/server';
import { defaultLocale, type Locale } from '@/i18n/config';
import { applyEn, applyEnDeep, applyEnList, applyEnText } from '@/lib/i18n/apply-en';
import type { EnTable } from '@/lib/i18n/en-db-content';

/** The visitor's locale for this request. */
export async function getLang(): Promise<Locale> {
  try {
    return ((await getLocale()) as Locale) ?? defaultLocale;
  } catch {
    // Outside a request there is no cookie to read — Next.js calls `generateStaticParams` at build
    // time with no HTTP request, and `cookies()` throws there. Falling back to the source language
    // keeps build-time slug enumeration working; nothing user-visible is rendered in that phase.
    return defaultLocale;
  }
}

/**
 * Translate one database row for the active locale.
 * Indonesian returns the row untouched — that is what makes the source language the zero-overlay default.
 */
export async function localizeRow<T>(table: EnTable, row: T): Promise<T> {
  const lang = await getLang();
  return lang === 'en' ? applyEn(table, row) : row;
}

/** Translate a list of database rows for the active locale. */
export async function localizeRows<T>(table: EnTable, rows: T[]): Promise<T[]> {
  const lang = await getLang();
  return lang === 'en' ? applyEnList(table, rows) : rows;
}

/** Translate a free-standing content string (a value fetched without its row key). */
export async function localizeText(value: string): Promise<string> {
  const lang = await getLang();
  return lang === 'en' ? applyEnText(value) : value;
}

/** Recursively translate free-standing strings inside a JSON content value. */
export async function localizeDeep<T>(value: T): Promise<T> {
  const lang = await getLang();
  return lang === 'en' ? applyEnDeep(value) : value;
}

/**
 * Overlay one row for an explicitly supplied locale.
 *
 * Used where a caller already resolved the locale, or must stay synchronous (a pure mapper inside
 * an async list function) and therefore cannot await it.
 */
export function localizeRowWith<T>(lang: Locale, table: EnTable, row: T): T {
  return lang === 'en' ? applyEn(table, row) : row;
}

/** Overlay a list of rows for an explicitly supplied locale. */
export function localizeRowsWith<T>(lang: Locale, table: EnTable, rows: T[]): T[] {
  return lang === 'en' ? applyEnList(table, rows) : rows;
}

/** Locale-scoped cache key, so cached reads never leak one language to another visitor. */
export function withLangKey(base: string, lang: Locale): string {
  return `${base}:${lang}`;
}

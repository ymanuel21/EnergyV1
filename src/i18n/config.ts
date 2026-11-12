/**
 * i18n configuration — the single place that decides which locales exist and which one is the
 * source of truth.
 *
 * Source language
 * ---------------
 * EBT Plaza's original language is Indonesian, so `id` is both the default and the source
 * language: `messages/id.json` holds the client's own wording and is the baseline every other
 * locale is translated from. English is an added locale.
 *
 * Adding a language
 * -----------------
 * 1. add its tag to `locales`
 * 2. add `messages/<tag>.json` containing the same keys
 * 3. that's it — no component changes, because components reference keys, never sentences.
 */

export const locales = ['id', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Indonesian: the client's original language, used when no valid preference is stored. */
export const defaultLocale: Locale = 'id';

/** Cookie that carries the visitor's explicit choice. */
export const localeCookieName = 'NEXT_LOCALE';

/** One year, so a returning visitor keeps their choice. */
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

/** Display metadata for the language selector. */
export const localeLabels: Record<Locale, { native: string; short: string; htmlLang: string; ogLocale: string }> = {
  id: { native: 'Bahasa Indonesia', short: 'ID', htmlLang: 'id', ogLocale: 'id_ID' },
  en: { native: 'English', short: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
};

/** Narrow an arbitrary value (cookie, param) to a supported locale. */
export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'id' || value === 'en';
}

/** Parse a raw value, falling back to the source language for anything unrecognised. */
export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

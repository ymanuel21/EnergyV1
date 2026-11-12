/**
 * Server-only — reads site settings from the database for the active language.
 * NEVER imported by client components.
 *
 * The English layer is applied here, on top of the untouched Indonesian rows, and only when the
 * visitor's language is English. Indonesian visitors read the database values directly.
 */
import 'server-only';

import type { SiteSettings } from '@/lib/site';
import { setCachedSite, resolvePublicSiteUrl } from '@/lib/site';
import { getPrisma } from '@/lib/db';
import { applyEn } from '@/lib/i18n/apply-en';
import { cache } from '@/lib/platform';
import { getLocale } from 'next-intl/server';
import { localeLabels, defaultLocale, type Locale } from '@/i18n/config';

/** Phase 1: the settings table is read once per request (root layout). It is
 *  admin-written only, so the map is cached for 5 minutes. The cache holds RAW
 *  rows and is language-neutral; the English overlay is applied per request so
 *  one visitor's language can never leak to another. */
const SETTINGS_TTL_SECONDS = 300;
const SETTINGS_CACHE_KEY = 'site:settings';
const DEFAULTS: SiteSettings = {
  name: 'EBTPlaza', shortName: 'EBTPlaza',
  tagline: 'Energi Terbarukan, Harga Terjangkau!',
  description: 'Pusat produk energi terbarukan: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  email: 'info@ebtplaza.com', phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6285111023816',
  address: 'Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  url: resolvePublicSiteUrl(),
  company: 'EBTPlaza',
  logo: { letter: 'E', text: 'EBTPlaza' },
  og: { type: 'website' as const, siteName: 'EBTPlaza', locale: 'id_ID', twitterCard: 'summary_large_image' as const },
};

async function rawSettingRows(): Promise<Array<{ key: string; value: string }>> {
  if (!process.env.DATABASE_URL) return [];
  const cached = cache.get<Array<{ key: string; value: string }>>(SETTINGS_CACHE_KEY);
  if (cached) return cached;
  const prisma = await getPrisma();
  const rows = await prisma.siteSetting.findMany();
  const mapped = rows.map((r) => ({ key: r.key, value: r.value }));
  if (mapped.length > 0) cache.set(SETTINGS_CACHE_KEY, mapped, SETTINGS_TTL_SECONDS);
  return mapped;
}

/** Settings for one explicit language. Used by the layout, which also needs them before rendering. */
export async function loadSiteForLang(lang: Locale): Promise<SiteSettings> {
  try {
    const raw = await rawSettingRows();
    const rows = lang === 'en' ? raw.map((r) => applyEn('settings', r)) : raw;
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;    const settings: SiteSettings = {
      name: map.name || DEFAULTS.name,
      shortName: map.shortName || DEFAULTS.shortName,
      tagline: map.tagline || DEFAULTS.tagline,
      description: map.description || DEFAULTS.description,
      email: map.email || DEFAULTS.email,
      phone: map.phone || DEFAULTS.phone,
      whatsapp: map.whatsapp || DEFAULTS.whatsapp,
      address: map.address || DEFAULTS.address,
      // A stored deployment host must not become the canonical/origin URL.
      url: resolvePublicSiteUrl(map.url || DEFAULTS.url),
      company: map.company || DEFAULTS.company,
      logo: { letter: map.logoLetter || DEFAULTS.logo.letter, text: map.logoText || DEFAULTS.logo.text },
      // Open Graph locale follows the rendering language so shares carry the right locale.
      og: { ...DEFAULTS.og, locale: localeLabels[lang].ogLocale },
    };
    setCachedSite(settings, lang);
    return settings;
  } catch (e) {
    console.error('[site-server] DB read failed:', (e as Error).message);
    setCachedSite(DEFAULTS, lang);
    return DEFAULTS;
  }
}

/** Settings for the visitor's active language. */
export async function loadSiteFromDb(): Promise<SiteSettings> {
  return loadSiteForLang((await getLocale()) as Locale);
}

export { DEFAULTS as SITE_DEFAULTS };

/**
 * Server-only — reads site settings from DB.
 * NEVER imported by client components.
 */
import 'server-only';

import type { SiteSettings } from '@/lib/site';
import { setCachedSite } from '@/lib/site';
import { getPrisma } from '@/lib/db';
import { applyEn } from '@/lib/i18n/apply-en';

const DEFAULTS: SiteSettings = {
  name: 'EBTPlaza', shortName: 'EBTPlaza',
  tagline: 'Renewable Energy at Affordable Prices!',
  description: 'Your hub for renewable energy products: solar panels, inverters, lithium batteries, solar power systems and project supplies.',
  email: 'info@ebtplaza.com', phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6285111023816',
  address: 'Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Arcamanik District, Bandung City, West Java 40293',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebtplaza.vercel.app',
  company: 'EBTPlaza',
  logo: { letter: 'E', text: 'EBTPlaza' },
  og: { type: 'website' as const, siteName: 'EBTPlaza', locale: 'en_US', twitterCard: 'summary_large_image' as const },
};

export async function loadSiteFromDb() {
  try {
    if (!process.env.DATABASE_URL) { setCachedSite(DEFAULTS); return DEFAULTS; }
    const prisma = await getPrisma();
    const rawRows = await prisma.siteSetting.findMany();
    // English overlay, keyed by the setting key (`tagline`, `description`, `address`, …).
    const rows = rawRows.map((r) => applyEn('settings', r));
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    const settings: SiteSettings = {
      name: map.name || DEFAULTS.name,
      shortName: map.shortName || DEFAULTS.shortName,
      tagline: map.tagline || DEFAULTS.tagline,
      description: map.description || DEFAULTS.description,
      email: map.email || DEFAULTS.email,
      phone: map.phone || DEFAULTS.phone,
      whatsapp: map.whatsapp || DEFAULTS.whatsapp,
      address: map.address || DEFAULTS.address,
      url: map.url || DEFAULTS.url,
      company: map.company || DEFAULTS.company,
      logo: { letter: map.logoLetter || DEFAULTS.logo.letter, text: map.logoText || DEFAULTS.logo.text },
      og: DEFAULTS.og,
    };
    setCachedSite(settings);
    return settings;
  } catch (e) {
    console.error('[site-server] DB read failed:', (e as Error).message);
    setCachedSite(DEFAULTS);
    return DEFAULTS;
  }
}

/**
 * Single source of truth for EBTPlaza site branding.
 *
 * All components read from getSite() or getSiteSync().
 * Admin /settings writes to site_settings table.
 * getSite() merges DB values over these fallback defaults.
 */

export interface SiteSettings {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  url: string;
  company: string;
  logo: { letter: string; text: string };
  og: { type: string; siteName: string; locale: string; twitterCard: string };
}

/** Fallback defaults — used when DB has no overrides */
const DEFAULTS: SiteSettings = {
  name: 'EBTPlaza',
  shortName: 'EBTPlaza',
  tagline: 'Energi Terbarukan, Harga Terjangkau!',
  description: 'Pusat produk energi terbarukan: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  email: 'info@ebtplaza.com',
  phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6282112850215',
  address: 'Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebtplaza.vercel.app',
  company: 'EBTPlaza',
  logo: { letter: 'E', text: 'EBTPlaza' },
  og: { type: 'website', siteName: 'EBTPlaza', locale: 'id_ID', twitterCard: 'summary_large_image' },
};

/** DB-first: reads site_settings, falls back to DEFAULTS */
export async function getSite(): Promise<SiteSettings> {
  try {
    if (!process.env.DATABASE_URL) return DEFAULTS;
    const { getPrisma } = await import('@/lib/db');
    const prisma = await getPrisma();
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return {
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
  } catch {
    return DEFAULTS;
  }
}

// Cached singleton for sync access (layout populates on first call)
let _cached: SiteSettings | null = null;

export function setCachedSite(settings: SiteSettings) { _cached = settings; }
export function getSiteSync(): SiteSettings { return _cached ?? DEFAULTS; }

// Backward compat — apps that can't easily go async use this
export const SITE = {
  get name() { return getSiteSync().name; },
  get shortName() { return getSiteSync().shortName; },
  get tagline() { return getSiteSync().tagline; },
  get description() { return getSiteSync().description; },
  get email() { return getSiteSync().email; },
  get phone() { return getSiteSync().phone; },
  get whatsapp() { return getSiteSync().whatsapp; },
  get address() { return getSiteSync().address; },
  get url() { return getSiteSync().url; },
  get company() { return getSiteSync().company; },
  get logo() { return getSiteSync().logo; },
  get og() { return getSiteSync().og; },
};

export const SITE_CONFIG = SITE;

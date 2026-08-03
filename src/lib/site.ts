/**
 * Client-safe — never imports Prisma or Node.js modules.
 * All SITE/SITE_CONFIG consumers import from here.
 */

export interface SiteSettings {
  name: string; shortName: string; tagline: string; description: string;
  email: string; phone: string; whatsapp: string; address: string; url: string;
  company: string;
  logo: { letter: string; text: string };
  og: { type: string; siteName: string; locale: string; twitterCard: string };
}

const DEFAULTS: SiteSettings = {
  name: 'EBTPlaza', shortName: 'EBTPlaza',
  tagline: 'Energi Terbarukan, Harga Terjangkau!',
  description: 'Pusat produk energi terbarukan: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  email: 'info@ebtplaza.com', phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6282112850215',
  address: 'Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebtplaza.vercel.app',
  company: 'EBTPlaza',
  logo: { letter: 'E', text: 'EBTPlaza' },
  og: { type: 'website' as const, siteName: 'EBTPlaza', locale: 'id_ID', twitterCard: 'summary_large_image' as const },
};

let _cached: SiteSettings | null = null;

export function setCachedSite(settings: SiteSettings) { _cached = settings; }
export function getSiteSync(): SiteSettings { return _cached ?? DEFAULTS; }

// SITE proxy — getters read from cached or defaults
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

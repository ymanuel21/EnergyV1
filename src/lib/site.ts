/**
 * Single source of truth for EBTPlaza site branding.
 *
 * Every component must read from this config instead of hardcoding
 * brand names, URLs, or logo text.
 */

export const SITE_CONFIG = {
  /** Full site name used in titles, metadata, admin */
  name: 'EBTPlaza',
  /** Short name for space-constrained contexts */
  shortName: 'EBTPlaza',
  /** Tagline shown in hero, footer, metadata */
  tagline: 'Energi Terbarukan, Harga Terjangkau!',
  /** Meta description */
  description:
    'Pusat produk energi terbarukan: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  /** Canonical URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ebtplaza.vercel.app',
  /** Contact */
  email: 'info@ebtplaza.com',
  phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6282112850215',
  /** Company / legal entity */
  company: 'EBTPlaza',
  /** Full address */
  address:
    'Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  /** Logo */
  logo: {
    /** Single-letter icon shown in the colored square */
    letter: 'E',
    /** Full logo text next to the icon (desktop header/footer) */
    text: 'EBTPlaza',
  },
  /** OpenGraph / Twitter defaults */
  og: {
    type: 'website' as const,
    siteName: 'EBTPlaza',
    locale: 'id_ID',
    twitterCard: 'summary_large_image' as const,
  },
} as const;

// Re-export for backward compatibility with existing code
export const SITE = SITE_CONFIG;

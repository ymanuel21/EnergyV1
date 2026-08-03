/**
 * Server-only — reads site settings from DB.
 * NEVER imported by client components.
 */
import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import type { SiteSettings } from '@/lib/site';
import { setCachedSite } from '@/lib/site';

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

export async function loadSiteFromDb() {
  try {
    if (!process.env.DATABASE_URL) { setCachedSite(DEFAULTS); return DEFAULTS; }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    const rows = await prisma.siteSetting.findMany();
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

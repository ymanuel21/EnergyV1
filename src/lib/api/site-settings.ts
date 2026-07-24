import 'server-only';
import { getPrisma } from '@/lib/db';
import { SITE } from '@/lib/constants';

export async function getSiteSettings() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.siteSetting.findMany();
      if (rows.length > 0) {
        const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        return {
          name: map.name ?? SITE.name,
          tagline: map.tagline ?? SITE.tagline,
          description: map.description ?? SITE.description,
          email: map.email ?? SITE.email,
          phone: map.phone ?? SITE.phone,
          whatsapp: map.whatsapp ?? SITE.whatsapp,
          address: map.address ?? SITE.address,
          url: map.url ?? SITE.url,
        };
      }
    }
  } catch (e) { console.error('Prisma getSiteSettings failed:', (e as Error).message); }
  return {
    name: SITE.name,
    tagline: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    phone: SITE.phone,
    whatsapp: SITE.whatsapp,
    address: SITE.address,
    url: SITE.url,
  };
}

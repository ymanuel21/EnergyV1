import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getHeroBanners() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.banner.findMany({ where: { type: 'hero', isActive: true }, orderBy: { sortOrder: 'asc' } });
      if (rows.length > 0) return rows.map((b: any) => ({
        src: b.src ?? b.image ?? '/images/placeholder/product-placeholder.png',
        alt: b.alt ?? b.title ?? '',
        href: b.link ?? undefined,
        width: 1280,
        height: 427,
      }));
    }
  } catch (e) { console.error('Prisma getHeroBanners failed:', (e as Error).message); }
  return (await import('@/lib/data/banners')).banners;
}

export async function getNeedCards() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.banner.findMany({ where: { type: 'need-card', isActive: true }, orderBy: { sortOrder: 'asc' } });
      if (rows.length > 0) return rows.map((b: any) => ({
        title: b.title ?? '',
        description: b.description ?? '',
        image: b.image ?? b.src ?? '/images/placeholder/product-placeholder.png',
        href: b.link ?? '',
        cta: b.label ?? 'Lihat',
      }));
    }
  } catch (e) { console.error('Prisma getNeedCards failed:', (e as Error).message); }
  return (await import('@/lib/data/banners')).needCards;
}

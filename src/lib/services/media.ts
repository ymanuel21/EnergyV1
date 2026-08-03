import type { PrismaClient } from '@prisma/client';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  source: string;
  sourceName: string;
  sourceId: string;
  type: 'image';
  usages?: MediaItem[];
}

export async function aggregateMediaDatabase(prisma: PrismaClient): Promise<MediaItem[]> {
  const items: MediaItem[] = [];

  const extractName = (url: string) => {
    try {
      const name = new URL(url).pathname.split('/').pop() || url;
      return name.split('?')[0];
    } catch { return url.split('/').pop() || url; }
  };

  // Products
  try {
    const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
    for (const p of products) {
      const imgs = (p.images as unknown as string[]) || [];
      imgs.forEach((url, i) => { if (url) items.push({ id: `p-${p.id}-${i}`, url, name: extractName(url), source: 'product', sourceName: p.name, sourceId: p.id, type: 'image' }); });
    }
  } catch (e: any) { console.error('[Media] Products:', e?.message); }

  // Projects
  try {
    const projects = await prisma.project.findMany({ select: { id: true, title: true, coverImage: true, images: true } });
    for (const p of projects) {
      if (p.coverImage) items.push({ id: `pr-${p.id}-cover`, url: p.coverImage, name: extractName(p.coverImage), source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' });
      (p.images as unknown as string[] || []).forEach((url, i) => { if (url) items.push({ id: `pr-${p.id}-${i}`, url, name: extractName(url), source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' }); });
    }
  } catch (e: any) { console.error('[Media] Projects:', e?.message); }

  // Brands
  try {
    const brands = await prisma.brand.findMany({ select: { id: true, name: true, logo: true } });
    for (const b of brands) {
      if (b.logo) items.push({ id: `b-${b.id}`, url: b.logo, name: extractName(b.logo), source: 'brand', sourceName: b.name, sourceId: b.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Brands:', e?.message); }

  // Banners
  try {
    const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true } });
    for (const b of banners) {
      if (b.image) items.push({ id: `bn-${b.id}`, url: b.image, name: extractName(b.image), source: 'banner', sourceName: b.title || b.id, sourceId: b.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Banners:', e?.message); }

  // Testimonials
  try {
    const testimonials = await prisma.testimonial.findMany({ select: { id: true, name: true, photo: true } });
    for (const t of testimonials) {
      if (t.photo) items.push({ id: `t-${t.id}`, url: t.photo, name: extractName(t.photo), source: 'testimonial', sourceName: t.name, sourceId: t.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Testimonials:', e?.message); }

  return items;
}

/** Count unique assets (by URL) from aggregated media */
export function countUniqueAssets(items: MediaItem[]): number {
  return new Set(items.map(i => i.url)).size;
}

'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

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

export async function getMediaDatabase(search?: string): Promise<MediaItem[]> {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const items: MediaItem[] = [];

  const extractName = (url: string) => {
    try {
      const p = new URL(url).pathname;
      const name = p.split('/').pop() || url;
      return name.split('?')[0];
    } catch { return url.split('/').pop() || url; }
  };

  // ── Products ──
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true, images: true },
    });
    for (const p of products) {
      const imgs = (p.images as unknown as string[]) || [];
      imgs.forEach((url, i) => {
        if (url) items.push({ id: `${p.id}-${i}`, url, name: extractName(url), source: 'product', sourceName: p.name, sourceId: p.id, type: 'image' });
      });
    }
  } catch (e: any) { console.error('[Media] Products failed:', e?.message || e); }

  // ── Projects ──
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, title: true, slug: true, coverImage: true, images: true },
    });
    for (const p of projects) {
      if (p.coverImage) items.push({ id: `${p.id}-cover`, url: p.coverImage, name: extractName(p.coverImage), source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' });
      const imgs = (p.images as unknown as string[]) || [];
      imgs.forEach((url, i) => {
        if (url) items.push({ id: `${p.id}-img-${i}`, url, name: extractName(url), source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' });
      });
    }
  } catch (e: any) { console.error('[Media] Projects failed:', e?.message || e); }

  // ── Brands ──
  try {
    const brands = await prisma.brand.findMany({ select: { id: true, name: true, logo: true } });
    for (const b of brands) {
      if (b.logo) items.push({ id: `${b.id}-logo`, url: b.logo, name: extractName(b.logo), source: 'brand', sourceName: b.name, sourceId: b.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Brands failed:', e?.message || e); }

  // ── Banners ──
  try {
    const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true } });
    for (const b of banners) {
      if (b.image) items.push({ id: `${b.id}-banner`, url: b.image, name: extractName(b.image), source: 'banner', sourceName: b.title || b.id, sourceId: b.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Banners failed:', e?.message || e); }

  // ── Testimonials ──
  try {
    const testimonials = await prisma.testimonial.findMany({ select: { id: true, name: true, photo: true } });
    for (const t of testimonials) {
      if (t.photo) items.push({ id: `${t.id}-photo`, url: t.photo, name: extractName(t.photo), source: 'testimonial', sourceName: t.name, sourceId: t.id, type: 'image' });
    }
  } catch (e: any) { console.error('[Media] Testimonials failed:', e?.message || e); }

  return items;
}

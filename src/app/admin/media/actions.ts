'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  source: string;      // 'product' | 'project' | 'brand' | 'banner' | 'testimonial' | 'homepage'
  sourceName: string;   // entity name (e.g. "EcoFlow 160W")
  sourceId: string;     // entity ID
  type: 'image';
  width?: number;
  height?: number;
}

export async function getMediaDatabase(search?: string): Promise<MediaItem[]> {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const items: MediaItem[] = [];

  // ── Products ──
  const products = await prisma.product.findMany({
    where: { images: search ? { path: ['$[*]'], string_contains: search } as any : undefined },
    select: { id: true, name: true, slug: true, images: true },
  });
  for (const p of products) {
    const imgs = (p.images as unknown as string[]) || [];
    imgs.forEach((url, i) => {
      if (url) items.push({ id: `${p.id}-${i}`, url, name: url.split('/').pop() || url, source: 'product', sourceName: p.name, sourceId: p.id, type: 'image' });
    });
  }

  // ── Projects ──
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, slug: true, coverImage: true, images: true },
  });
  for (const p of projects) {
    if (p.coverImage) items.push({ id: `${p.id}-cover`, url: p.coverImage, name: p.coverImage.split('/').pop() || p.coverImage, source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' });
    const imgs = (p.images as unknown as string[]) || [];
    imgs.forEach((url, i) => {
      if (url) items.push({ id: `${p.id}-img-${i}`, url, name: url.split('/').pop() || url, source: 'project', sourceName: p.title, sourceId: p.id, type: 'image' });
    });
  }

  // ── Brands ──
  const brands = await prisma.brand.findMany({ select: { id: true, name: true, logo: true } });
  for (const b of brands) {
    if (b.logo) items.push({ id: `${b.id}-logo`, url: b.logo, name: b.logo.split('/').pop() || b.logo, source: 'brand', sourceName: b.name, sourceId: b.id, type: 'image' });
  }

  // ── Banners ──
  const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true } });
  for (const b of banners) {
    if (b.image) items.push({ id: `${b.id}-banner`, url: b.image, name: b.image.split('/').pop() || b.image, source: 'banner', sourceName: b.title || b.id, sourceId: b.id, type: 'image' });
  }

  // ── Testimonials ──
  const testimonials = await prisma.testimonial.findMany({ select: { id: true, name: true, photo: true } });
  for (const t of testimonials) {
    if (t.photo) items.push({ id: `${t.id}-photo`, url: t.photo, name: t.photo.split('/').pop() || t.photo, source: 'testimonial', sourceName: t.name, sourceId: t.id, type: 'image' });
  }

  // ── Homepage sections ──
  const sections = await prisma.homepageSection.findMany({ include: { versions: { where: { status: 'published' }, take: 1 } } });
  for (const s of sections) {
    const v = s.versions[0];
    const settings = (v?.settings || {}) as any;
    if (settings?.imageId) items.push({ id: `${s.id}-hero`, url: settings.imageId, name: settings.imageId.split('/').pop() || settings.imageId, source: 'homepage', sourceName: v?.title || s.type, sourceId: s.id, type: 'image' });
  }

  // Group by URL to detect shared usage
  const byUrl = new Map<string, MediaItem[]>();
  for (const item of items) {
    const existing = byUrl.get(item.url) || [];
    existing.push(item);
    byUrl.set(item.url, existing);
  }

  // Filter by search
  let result = items;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(i => i.name.toLowerCase().includes(q) || i.url.toLowerCase().includes(q) || i.sourceName.toLowerCase().includes(q));
  }

  return result.map(item => ({ ...item, usages: byUrl.get(item.url) || [item] }));
}

// Re-export with usages
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

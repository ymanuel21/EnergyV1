'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { aggregateMediaDatabase } from '@/lib/services/media';

export async function getMediaDatabase(search?: string): Promise<any[]> {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const items = await aggregateMediaDatabase(prisma);

  // Group by URL to detect shared usage
  const normalizeUrl = (url: string) => { try { const u = new URL(url); return u.origin + u.pathname; } catch { return url; } };
  const byUrl = new Map<string, any[]>();
  for (const item of items) {
    const key = normalizeUrl(item.url);
    const existing = byUrl.get(key) || [];
    existing.push(item);
    byUrl.set(key, existing);
  }

  let result = items;
  if (search) {
    const q = search.toLowerCase();
    result = items.filter(i => i.name.toLowerCase().includes(q) || i.url.toLowerCase().includes(q) || i.sourceName.toLowerCase().includes(q));
  }

  return result.map(item => ({ ...item, usages: byUrl.get(normalizeUrl(item.url)) || [item] }));
}

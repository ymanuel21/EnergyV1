'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function getAssets(search?: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const where: any = {};
  if (search) where.filename = { contains: search };
  const rows = await prisma.asset.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  return rows;
}

export async function getAssetUsage(assetId: string): Promise<string[]> {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const usages: string[] = [];

  // Check products (images is a JSON array of asset IDs)
  const allProducts = await prisma.product.findMany({ select: { name: true, images: true } });
  for (const p of allProducts) {
    const imgs = (p.images as unknown as string[]) || [];
    if (imgs.includes(assetId)) usages.push(`Product: ${p.name}`);
  }

  // Check banners
  const allBanners = await prisma.banner.findMany({ select: { title: true, image: true } });
  for (const b of allBanners) {
    if (b.image === assetId) usages.push(`Banner: ${b.title || 'untitled'}`);
  }

  // Check homepage sections (settings may contain imageId)
  const sections = await prisma.homepageSection.findMany();
  for (const s of sections) {
    const settings = s.settings as any;
    if (settings?.imageId === assetId) usages.push(`Homepage Section: ${s.title || s.type}`);
    if (settings?.bannerId === assetId) usages.push(`Homepage Banner: ${s.title || s.type}`);
  }

  return usages;
}

export async function deleteAsset(assetId: string): Promise<{ success: boolean; message: string }> {
  await requireAuth();
  const usages = await getAssetUsage(assetId);
  if (usages.length > 0) {
    return { success: false, message: `Cannot delete: used by ${usages.join(', ')}` };
  }
  const prisma = await getAdminPrisma();
  await prisma.asset.delete({ where: { id: assetId } });
  revalidatePath('/admin/media');
  return { success: true, message: 'Deleted' };
}

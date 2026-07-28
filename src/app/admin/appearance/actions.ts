'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { theme } from '@/lib/theme';

export type ThemeKey = keyof typeof theme.colors | keyof typeof theme.typography.heading | string;

export async function getAppearanceSettings(): Promise<Record<string, string>> {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'theme_' } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

export async function saveAppearance(formData: FormData) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const publish = formData.get('_publish') === 'true';
  const prefix = publish ? 'theme_' : 'theme_draft_';

  const keys: string[] = [
    'primary', 'primary_hover', 'surface', 'card', 'muted',
    'border', 'accent', 'dark_bg',
    'radius_sm', 'radius_md', 'radius_lg', 'radius_full',
    'container', 'heading_weight',
    'shadow_card', 'shadow_lg',
  ];

  for (const k of keys) {
    const value = formData.get(k) as string;
    if (value !== null && value !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: prefix + k },
        update: { value },
        create: { key: prefix + k, value },
      });
    }
  }

  return { success: true };
}

export async function resetAppearance() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.siteSetting.deleteMany({
    where: { key: { startsWith: 'theme_' } },
  });
  return { success: true };
}

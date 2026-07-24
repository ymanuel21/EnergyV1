import type { Category } from '@/types/product';

export const categories: Category[] = [
  {
    id: 'cat-panel-surya',
    slug: 'panel-surya',
    name: 'Panel Surya',
    productCount: 9,
    children: [
      { id: 'subcat-monocrystalline', slug: 'monocrystalline', name: 'Monocrystalline', parentId: 'cat-panel-surya', productCount: 5 },
      { id: 'subcat-polycrystalline', slug: 'polycrystalline', name: 'Polycrystalline', parentId: 'cat-panel-surya', productCount: 2 },
    ],
  },
  {
    id: 'cat-inverter',
    slug: 'inverter',
    name: 'Inverter',
    productCount: 5,
  },
  {
    id: 'cat-baterai',
    slug: 'baterai',
    name: 'Baterai',
    productCount: 8,
  },
  {
    id: 'cat-solar-charge-controller',
    slug: 'solar-charge-controller',
    name: 'Solar Charge Controller',
    productCount: 3,
  },
  {
    id: 'cat-paket-plts',
    slug: 'paket-plts',
    name: 'Paket PLTS',
    productCount: 4,
  },
  {
    id: 'cat-mounting-rangka',
    slug: 'mounting-rangka',
    name: 'Mounting & Rangka',
    productCount: 3,
  },
  {
    id: 'cat-kabel-konektor-proteksi',
    slug: 'kabel-konektor-proteksi',
    name: 'Kabel, Konektor & Proteksi',
    productCount: 5,
  },
  {
    id: 'cat-pompa-air-tenaga-surya',
    slug: 'pompa-air-tenaga-surya',
    name: 'Pompa Air Tenaga Surya',
    productCount: 2,
  },
  {
    id: 'cat-brand',
    slug: 'brand',
    name: 'Brand',
    productCount: 10,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug) ??
    categories.flatMap((c) => c.children ?? []).find((c) => c.slug === slug);
}

export function getCategoryTree(): Category[] {
  return categories;
}

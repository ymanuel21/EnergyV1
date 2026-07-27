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
    children: [
      { id: 'subcat-inv-ongrid', slug: 'on-grid', name: 'On-Grid', parentId: 'cat-inverter', productCount: 2 },
      { id: 'subcat-inv-offgrid', slug: 'off-grid', name: 'Off-Grid', parentId: 'cat-inverter', productCount: 1 },
      { id: 'subcat-inv-hybrid', slug: 'hybrid', name: 'Hybrid', parentId: 'cat-inverter', productCount: 2 },
      { id: 'subcat-inv-micro', slug: 'microinverter', name: 'Microinverter', parentId: 'cat-inverter', productCount: 0 },
      { id: 'subcat-inv-single', slug: 'single-phase', name: 'Single Phase', parentId: 'cat-inverter', productCount: 2 },
      { id: 'subcat-inv-three', slug: 'three-phase', name: 'Three Phase', parentId: 'cat-inverter', productCount: 1 },
    ],
  },
  {
    id: 'cat-baterai',
    slug: 'baterai',
    name: 'Baterai',
    productCount: 8,
    children: [
      { id: 'subcat-bat-lfp', slug: 'lithium-lifepo4', name: 'Lithium LiFePO4', parentId: 'cat-baterai', productCount: 5 },
      { id: 'subcat-bat-rack', slug: 'rack-mounted', name: 'Rack Mounted', parentId: 'cat-baterai', productCount: 2 },
      { id: 'subcat-bat-wall', slug: 'wall-mounted', name: 'Wall Mounted', parentId: 'cat-baterai', productCount: 1 },
      { id: 'subcat-bat-ess', slug: 'all-in-one-ess', name: 'All-in-One (ESS)', parentId: 'cat-baterai', productCount: 3 },
    ],
  },
  {
    id: 'cat-solar-charge-controller',
    slug: 'solar-charge-controller',
    name: 'Solar Charge Controller',
    productCount: 3,
    children: [
      { id: 'subcat-scc-mppt', slug: 'mppt', name: 'MPPT', parentId: 'cat-solar-charge-controller', productCount: 2 },
      { id: 'subcat-scc-pwm', slug: 'pwm', name: 'PWM', parentId: 'cat-solar-charge-controller', productCount: 1 },
    ],
  },
  {
    id: 'cat-paket-plts',
    slug: 'paket-plts',
    name: 'Paket PLTS',
    productCount: 4,
    children: [
      { id: 'subcat-pkt-ongrid', slug: 'on-grid', name: 'On-Grid', parentId: 'cat-paket-plts', productCount: 1 },
      { id: 'subcat-pkt-offgrid', slug: 'off-grid', name: 'Off-Grid', parentId: 'cat-paket-plts', productCount: 1 },
      { id: 'subcat-pkt-hybrid', slug: 'hybrid', name: 'Hybrid', parentId: 'cat-paket-plts', productCount: 1 },
      { id: 'subcat-pkt-rumah', slug: 'rumah', name: 'Rumah', parentId: 'cat-paket-plts', productCount: 2 },
      { id: 'subcat-pkt-kantor', slug: 'kantor', name: 'Kantor', parentId: 'cat-paket-plts', productCount: 1 },
      { id: 'subcat-pkt-industri', slug: 'industri', name: 'Industri', parentId: 'cat-paket-plts', productCount: 1 },
    ],
  },
  {
    id: 'cat-mounting-rangka',
    slug: 'mounting-rangka',
    name: 'Mounting & Rangka',
    productCount: 3,
    children: [
      { id: 'subcat-mnt-roof', slug: 'atap-rooftop', name: 'Atap / Rooftop', parentId: 'cat-mounting-rangka', productCount: 2 },
      { id: 'subcat-mnt-ground', slug: 'ground-mounting', name: 'Ground Mounting', parentId: 'cat-mounting-rangka', productCount: 1 },
      { id: 'subcat-mnt-carport', slug: 'carport-canopy', name: 'Carport / Canopy', parentId: 'cat-mounting-rangka', productCount: 0 },
    ],
  },
  {
    id: 'cat-kabel-konektor-proteksi',
    slug: 'kabel-konektor-proteksi',
    name: 'Kabel, Konektor & Proteksi',
    productCount: 5,
    children: [
      { id: 'subcat-cbl-pv', slug: 'kabel-pv', name: 'Kabel PV', parentId: 'cat-kabel-konektor-proteksi', productCount: 2 },
      { id: 'subcat-cbl-mc4', slug: 'konektor-mc4', name: 'Konektor MC4', parentId: 'cat-kabel-konektor-proteksi', productCount: 1 },
      { id: 'subcat-cbl-mcb', slug: 'dc-mcb-mccb', name: 'MCB / MCCB DC', parentId: 'cat-kabel-konektor-proteksi', productCount: 1 },
      { id: 'subcat-cbl-spd', slug: 'spd-arrester', name: 'SPD / Arrester', parentId: 'cat-kabel-konektor-proteksi', productCount: 1 },
      { id: 'subcat-cbl-comb', slug: 'combiner-box', name: 'Combiner Box', parentId: 'cat-kabel-konektor-proteksi', productCount: 1 },
    ],
  },
  {
    id: 'cat-pompa-air-tenaga-surya',
    slug: 'pompa-air-tenaga-surya',
    name: 'Pompa Air Tenaga Surya',
    productCount: 2,
    children: [
      { id: 'subcat-pump-sub', slug: 'submersible', name: 'Submersible', parentId: 'cat-pompa-air-tenaga-surya', productCount: 1 },
      { id: 'subcat-pump-surf', slug: 'surface', name: 'Surface', parentId: 'cat-pompa-air-tenaga-surya', productCount: 1 },
    ],
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

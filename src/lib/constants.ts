import { SITE_CONFIG } from './site';

export const SITE = SITE_CONFIG;
export { SITE_CONFIG };

export const NAV_LINKS = {
  utility: [
    { label: 'Semua Produk', href: '/produk' },
    { label: 'Promo', href: '/promo' },
    { label: 'Clearance', href: '/barang-clearance' },
    { label: 'Permintaan Penawaran', href: '/permintaan-penawaran' },
    { label: 'Bantuan', href: '/faq' },
  ],
  categories: [
    { label: 'Panel Surya', href: '/kategori/panel-surya' },
    { label: 'Inverter', href: '/kategori/inverter' },
    { label: 'Baterai', href: '/kategori/baterai' },
    { label: 'Solar Charge Controller', href: '/kategori/solar-charge-controller' },
    { label: 'Paket PLTS', href: '/kategori/paket-plts' },
    { label: 'Mounting & Rangka', href: '/kategori/mounting-rangka' },
    { label: 'Kabel, Konektor & Proteksi', href: '/kategori/kabel-konektor-proteksi' },
    { label: 'Pompa Air Tenaga Surya', href: '/kategori/pompa-air-tenaga-surya' },
    { label: 'Brand', href: '/brand' },
  ],
  footer: {
    belanja: [
      { label: 'Semua Produk', href: '/produk' },
      { label: 'Brand', href: '/brand' },
      { label: 'Promo', href: '/promo' },
      { label: 'Produk Baru', href: '/produk-baru' },
      { label: 'Clearance', href: '/barang-clearance' },
    ],
    layanan: [
      { label: 'Permintaan Penawaran', href: '/permintaan-penawaran' },
      { label: 'Panduan Energi Surya', href: '/artikel' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Tentang Kami', href: '/halaman/tentang-kami' },
      { label: 'Kebijakan Pengiriman', href: '/halaman/kebijakan-pengiriman' },
      { label: 'Kebijakan Retur', href: '/halaman/kebijakan-retur' },
    ],
  },
} as const;

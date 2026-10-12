import { SITE_CONFIG } from './site';

export const SITE = SITE_CONFIG;
export { SITE_CONFIG };

export const NAV_LINKS = {
  utility: [
    { label: 'All Products', href: '/produk' },
    { label: 'Promotions', href: '/promo' },
    { label: 'Clearance', href: '/barang-clearance' },
    { label: 'Request a Quote', href: '/permintaan-penawaran' },
    { label: 'Help', href: '/faq' },
  ],
  categories: [
    { label: 'Solar Panels', href: '/kategori/panel-surya' },
    { label: 'Inverter', href: '/kategori/inverter' },
    { label: 'Batteries', href: '/kategori/baterai' },
    { label: 'Solar Charge Controller', href: '/kategori/solar-charge-controller' },
    { label: 'Paket PLTS', href: '/kategori/paket-plts' },
    { label: 'Mounting & Frames', href: '/kategori/mounting-rangka' },
    { label: 'Cables, Connectors & Protection', href: '/kategori/kabel-konektor-proteksi' },
    { label: 'Solar Water Pumps', href: '/kategori/pompa-air-tenaga-surya' },
    { label: 'Brand', href: '/brand' },
  ],
  footer: {
    belanja: [
      { label: 'All Products', href: '/produk' },
      { label: 'Brand', href: '/brand' },
      { label: 'Promotions', href: '/promo' },
      { label: 'New Products', href: '/produk-baru' },
      { label: 'Clearance', href: '/barang-clearance' },
    ],
    layanan: [
      { label: 'Request a Quote', href: '/permintaan-penawaran' },
      { label: 'Solar Energy Guide', href: '/artikel' },
      { label: 'FAQ', href: '/faq' },
      { label: 'About Us', href: '/halaman/tentang-kami' },
      { label: 'Shipping Policy', href: '/halaman/kebijakan-pengiriman' },
      { label: 'Return Policy', href: '/halaman/kebijakan-retur' },
    ],
  },
} as const;

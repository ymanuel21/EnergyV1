export const SITE = {
  name: 'EBTPlaza',
  tagline: 'Energi Terbarukan, Harga Terjangkau!',
  description: 'Pusat produk energi terbarukan EBTPlaza: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energi.click',
  email: 'info@energi.click',
  phone: '(022) 20522279',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6281234567890',
  address: 'Rekasurya EcoBuilding, Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  company: 'Rekasurya',
} as const;

export const NAV_LINKS = {
  utility: [
    { label: 'Semua Produk', href: '/produk' },
    { label: 'Promo', href: '/promo' },
    { label: 'Clearance', href: '/barang-clearance' },
    { label: 'Afiliator', href: '/afiliasi' },
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
      { label: 'Program Afiliasi', href: '/afiliasi' },
      { label: 'Panduan Energi Surya', href: '/artikel' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Tentang Rekasurya', href: '/halaman/tentang-kami' },
      { label: 'Kebijakan Pengiriman', href: '/halaman/kebijakan-pengiriman' },
      { label: 'Kebijakan Retur', href: '/halaman/kebijakan-retur' },
    ],
  },
} as const;

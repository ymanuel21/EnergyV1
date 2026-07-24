import type { Banner, NeedCard } from '@/types/product';

export const banners: Banner[] = [
  {
    src: '/images/placeholder/product-placeholder.png',
    alt: 'Header — Energi Cerdas, Tinggal Klik!',
    href: '/produk',
    width: 1280,
    height: 427,
  },
  {
    src: '/images/placeholder/product-placeholder.png',
    alt: 'Afiliasi — Dapatkan komisi',
    href: '/afiliasi',
    width: 1280,
    height: 427,
  },
];

export const needCards: NeedCard[] = [
  {
    title: 'Beli Produk',
    description: 'Sudah tahu produk yang dibutuhkan? Belanja langsung dari katalog.',
    image: '/images/placeholder/product-placeholder.png',
    href: '/produk',
    cta: 'Lihat Katalog',
  },
  {
    title: 'Pasang PLTS',
    description: 'Solusi lengkap tenaga surya untuk rumah, kantor, atau toko.',
    image: '/images/placeholder/product-placeholder.png',
    href: '/kategori/paket-plts',
    cta: 'Pilih Paket PLTS',
  },
  {
    title: 'Kebutuhan Proyek',
    description: 'Untuk kontraktor, perusahaan, & pengadaan skala besar.',
    image: '/images/placeholder/product-placeholder.png',
    href: '/permintaan-penawaran',
    cta: 'Minta Penawaran',
  },
];

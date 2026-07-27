import type { Banner, NeedCard } from '@/types/product';

export const banners: Banner[] = [
  {
    src: '/images/banners/hero-energi-cerdas.svg',
    alt: 'Energi Cerdas, Tinggal Klik! — EBTPlaza',
    href: '/produk',
    width: 1280,
    height: 427,
  },
  {
    src: '/images/banners/hero-afiliasi.svg',
    alt: 'Dapatkan Komisi — Program Afiliasi EBTPlaza',
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

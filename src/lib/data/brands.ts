import type { Brand } from '@/types/product';

export const brands: Brand[] = [
  { id: 'b-mitsubishi', slug: 'mitsubishi-electric', name: 'Mitsubishi Electric', productCount: 1, logo: '/images/brands/mitsubishi-electric.svg' },
  { id: 'b-canadian-solar', slug: 'canadian-solar', name: 'Canadian Solar', productCount: 1, logo: '/images/brands/canadian-solar.svg' },
  { id: 'b-longi', slug: 'longi', name: 'Longi', productCount: 1, logo: '/images/brands/longi.svg' },
  { id: 'b-bezvolt', slug: 'bezvolt', name: 'Bezvolt', productCount: 2, logo: '/images/brands/bezvolt.svg' },
  { id: 'b-bluetti', slug: 'bluetti', name: 'Bluetti', productCount: 1, logo: '/images/brands/bluetti.svg' },
  { id: 'b-aiko', slug: 'aiko', name: 'Aiko', productCount: 0, logo: '/images/brands/aiko.svg' },
  { id: 'b-sankelux', slug: 'sankelux', name: 'Sankelux', productCount: 0, logo: '/images/brands/sankelux.svg' },
  { id: 'b-gh-solar', slug: 'gh-solar', name: 'GH Solar', productCount: 0, logo: '/images/brands/gh-solar.svg' },
  { id: 'b-srne', slug: 'srne', name: 'SRNE', productCount: 0, logo: '/images/brands/srne.svg' },
  { id: 'b-rekasurya', slug: 'rekasurya', name: 'Rekasurya', productCount: 2, logo: '/images/brands/rekasurya.svg' },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

import type { Brand } from '@/types/product';

export const brands: Brand[] = [
  { id: 'b-mitsubishi', slug: 'mitsubishi-electric', name: 'Mitsubishi Electric', productCount: 1 },
  { id: 'b-canadian-solar', slug: 'canadian-solar', name: 'Canadian Solar', productCount: 1 },
  { id: 'b-longi', slug: 'longi', name: 'Longi', productCount: 1 },
  { id: 'b-bezvolt', slug: 'bezvolt', name: 'Bezvolt', productCount: 2 },
  { id: 'b-bluetti', slug: 'bluetti', name: 'Bluetti', productCount: 1 },
  { id: 'b-aiko', slug: 'aiko', name: 'Aiko', productCount: 0 },
  { id: 'b-sankelux', slug: 'sankelux', name: 'Sankelux', productCount: 0 },
  { id: 'b-gh-solar', slug: 'gh-solar', name: 'GH Solar', productCount: 0 },
  { id: 'b-srne', slug: 'srne', name: 'SRNE', productCount: 0 },
  { id: 'b-rekasurya', slug: 'rekasurya', name: 'Rekasurya', productCount: 2 },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

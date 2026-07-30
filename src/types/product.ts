export type ProductCondition =
  | 'new'
  | 'new-minor-defect'
  | 'new-project-leftover'
  | 'open-box'
  | 'display'
  | 'used';

export type ProductBadgeVariant = 'clearance' | 'promo' | 'new' | 'cheapest';

export type SortOption =
  | 'relevance'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'rating'
  | 'popular'
  | 'discount'
  | 'bestseller'
  | 'most-viewed'
  | 'biggest-discount';

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Specification {
  label: string;
  value: string;
}

export interface ProductDocument {
  name: string;
  url: string;
  size?: string;
}

export interface ProductQuestion {
  id: string;
  author: string;
  question: string;
  answer?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  brand?: { name: string; slug: string };
  categoryId: string;
  subcategoryId?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  condition: ProductCondition;
  stock: number;
  sku: string;
  model?: string;
  warranty: string;
  description: string;
  specifications: Specification[];
  documents?: ProductDocument[];
  badges: ProductBadgeVariant[];
  rating: number;
  reviewCount: number;
  questions: ProductQuestion[];
  weight: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId?: string;
  description?: string;
  image?: string;
  children?: Category[];
  productCount: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  productCount: number;
}

export interface Banner {
  src: string;
  alt: string;
  href?: string;
  width: number;
  height: number;
}

export interface NeedCard {
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
}

export const PRODUCT_CONDITIONS: ProductCondition[] = [
  'new',
  'new-minor-defect',
  'new-project-leftover',
  'open-box',
  'display',
  'used',
];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  'new': 'Baru',
  'new-minor-defect': 'Baru - Minor Defect',
  'new-project-leftover': 'Baru - Sisa Proyek',
  'open-box': 'Open Box',
  'display': 'Bekas Display',
  'used': 'Bekas Pakai',
};

import type { ProductCondition, SortOption } from './product';

export interface ProductFilters {
  brandIds?: string[];
  priceMin?: number;
  priceMax?: number;
  conditions?: ProductCondition[];
  minRating?: number;
  inStock?: boolean;
  readyToShip?: boolean;
  onPromo?: boolean;
  isNew?: boolean;
  isClearance?: boolean;
  needsQuote?: boolean;
  searchQuery?: string;
  page?: number;
}

export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface FilterOptions {
  brands: FilterOption[];
  priceRange: { min: number; max: number };
  conditions: { value: ProductCondition; label: string; count: number }[];
}

export const PER_PAGE = 12;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Paling Relevan' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'bestseller', label: 'Paling Laris' },
  { value: 'most-viewed', label: 'Paling Dilihat' },
  { value: 'biggest-discount', label: 'Diskon Terbesar' },
];

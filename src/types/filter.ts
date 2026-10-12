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
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Lowest Price' },
  { value: 'price-desc', label: 'Highest Price' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'bestseller', label: 'Best Selling' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'biggest-discount', label: 'Biggest Discount' },
];

export const VALID_SORTS = [
  'relevance', 'newest', 'price-asc', 'price-desc',
  'rating', 'bestseller', 'most-viewed', 'biggest-discount',
] as const;

export type ValidSort = typeof VALID_SORTS[number];

export function validateSort(value: string | undefined): ValidSort {
  if (value && VALID_SORTS.includes(value as ValidSort)) {
    return value as ValidSort;
  }
  return 'price-asc';
}

export function validatePage(value: string | undefined): number {
  const parsed = parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone.trim()) return true; // optional
  return /^[\d\s\-+()]{7,15}$/.test(phone);
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

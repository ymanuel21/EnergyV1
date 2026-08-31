// Shared slug normalization used by admin forms.
// Matches the slug regex `/^[a-z0-9-]+$/` enforced in src/lib/validations.ts.

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

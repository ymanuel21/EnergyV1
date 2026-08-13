// Product family grouping — derived, not admin-maintained.
//
// A "family" groups capacity variants of the same model (e.g. all
// SUN-*K*-SG05LP3-EU-SM2 inverters). Every variant stays an independent
// Product; they simply share a `familyKey`. The key is computed from the
// brand slug + model, so admins never have to type or maintain it.

/** Normalize a string to a URL-safe lowercase slug token. */
export function slugifyToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Derive a stable family key from brand + model.
 * Returns null when there is no model (no family grouping).
 * e.g. deriveFamilyKey('sungrow', 'SG05LP3-EU-SM2') => 'sungrow-sg05lp3-eu-sm2'
 */
export function deriveFamilyKey(
  brandSlug: string | null | undefined,
  model: string | null | undefined,
): string | null {
  const m = slugifyToken(model?.trim() ?? '');
  if (!m) return null;
  const b = slugifyToken(brandSlug?.trim() ?? '');
  return b ? `${b}-${m}` : m;
}

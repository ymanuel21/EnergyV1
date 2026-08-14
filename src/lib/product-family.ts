// Product family grouping — derived, not admin-maintained.
//
// A "family" groups capacity variants of the same model (e.g. all
// SUN-*K*-SG05LP3-EU-SM2 inverters). Every variant stays an independent
// Product; they simply share a `familyKey`. The key is computed from the
// brand slug + model, so admins never have to type or maintain it.
//
// The capacity token is stripped in a brand-scoped, position-specific way so
// unrelated products cannot collapse (see normalizeFamilyModel). SG and SH
// prefixes are deliberately NOT interchangeable: Sungrow SG = on-grid,
// SH = hybrid, so they map to different families.

/** Normalize a string to a URL-safe lowercase slug token. */
export function slugifyToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Strip the capacity token from a model so capacity variants share a family.
 * Brand-scoped so unrelated products are never merged:
 *   - huawei/deye : strip "<n>K" kW token ("2K","3.6K","10K","150K") -> keep "K"
 *   - sungrow     : strip kW digits right after SG/SH ("SG5.0RS" -> "SGRS", "SH5.0RS" -> "SHRS")
 *   - jinko       : strip Wp digits right after JKM ("JKM590N" -> "JKMN")
 *   - everything else: unchanged (no capacity token to strip)
 * Returns null when there is no model.
 */
export function normalizeFamilyModel(
  brandSlug: string | null | undefined,
  model: string | null | undefined,
): string | null {
  const raw = model?.trim() ?? '';
  if (!raw) return null;

  const brand = (brandSlug ?? '').trim().toLowerCase();
  let m = raw;

  if (brand === 'huawei' || brand === 'deye') {
    m = m.replace(/\d+(\.\d+)?K/gi, 'K');
  } else if (brand === 'sungrow') {
    m = m.replace(/^(SG|SH)\d+(\.\d+)?/i, '$1');
  } else if (brand === 'jinko-solar' || brand === 'jinko') {
    m = m.replace(/^(JKM)\d+/i, '$1');
  }

  const mm = slugifyToken(m);
  if (!mm) return null;
  const b = slugifyToken(brand);
  return b ? `${b}-${mm}` : mm;
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
  return normalizeFamilyModel(brandSlug, model);
}

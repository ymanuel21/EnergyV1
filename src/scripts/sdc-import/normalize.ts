// Deterministic normalizer: SdcSourceRow[] -> EnergyV1 Product drafts.
// Pure (no DB). Encodes every approved decision:
//   price=0 + priceDisplayMode=CONTACT_FOR_PRICE (per-product, never global)
//   source code -> model; sku only when globally unique AND valid
//   familyKey only for capacity-variant types (inverter/module); else NULL
//   names deterministic + slug-unique; conflicts (cross-section model) excluded

import { normalizeFamilyModel } from '../../lib/product-family';
import type { SdcSourceRow, SdcSpec } from './parser';

export interface NormalizedProduct {
  sourceRow: number;
  band: string;
  sectionTitle: string;
  brandName: string;
  brandSlug: string;
  categorySlug: string | null;
  model: string | null;
  sku: string | null;
  capacity: string | null;
  familyKey: string | null;
  name: string;
  slug: string;
  description: string;
  specifications: SdcSpec[];
  price: number;
  priceDisplayMode: string;
  stock: number;
  condition: string;
  status: string;
  isActive: boolean;
}

export interface ConflictRow {
  sourceRow: number;
  band: string;
  model: string | null;
  description: string;
  reason: string;
  sections: string[];
}

export interface NormalizeStats {
  total: number;
  products: number;
  conflicts: number;
  skuAssigned: number;
  skuNull: number;
  skuDuplicate: number;
  skuInvalid: number;
  modelNull: number;
  contactForPrice: number;
  familyCount: number;
  familyMultiMember: number;
  capacityExtracted: number;
}

const VALID_SKU = /^[A-Za-z0-9][A-Za-z0-9.\-_]*$/;

function slugify(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function capacityOf(text: string): string | null {
  if (!text) return null;
  const s = text;
  let m = s.match(/(\d+(?:\.\d+)?)\s*kwh\b/i);
  if (m) return `${m[1]} kWh`;
  m = s.match(/(\d+(?:\.\d+)?)\s*kw\b/i);
  if (m) return `${m[1]} kW`;
  m = s.match(/(\d+(?:\.\d+)?)\s*wp\b/i);
  if (m) return `${m[1]} Wp`;
  return null;
}

function categoryOf(brandSlug: string, title: string): string | null {
  const t = title.toUpperCase();
  if (t.includes('MODULE')) return 'panel-surya-monocrystalline';
  if (t.includes('ON-GRID')) return 'inverter-on-grid';
  if (t.includes('OFF-GRID')) return 'inverter-off-grid';
  if (t.includes('HYBRID')) return 'inverter-hybrid';
  if (/ESS\s*\(/.test(t)) return 'baterai-all-in-one-ess';
  if ((brandSlug === 'huawei' || brandSlug === 'deye') && t.includes('ACCESSORIES')) return 'aksesoris';
  if (t.includes('GROUND MOUNT')) return 'mounting-rangka-ground-mounting';
  if (t.includes('CARPORT')) return 'mounting-rangka-carport-canopy';
  if (t.includes('ROOFTOP') || t.includes('KLIPLOK') || t.includes('BALLAST')) return 'mounting-rangka-atap-rooftop';
  if (t.includes('WALKWAY')) return 'mounting-rangka';
  if (t.includes('ACCESSORIES') || t.includes('CLAMPS')) return 'mounting-rangka';
  if (t.includes('MOUNTING')) return 'mounting-rangka';
  return null;
}

function typeKeywordOf(title: string): string {
  const t = title.toUpperCase();
  if (t.includes('MODULE')) return 'Module';
  if (t.includes('ON-GRID')) return 'On-Grid Inverter';
  if (t.includes('OFF-GRID')) return 'Off-Grid Inverter';
  if (t.includes('HYBRID')) return 'Hybrid Inverter';
  if (/ESS\s*\(/.test(t)) return 'ESS';
  if (t.includes('ACCESSORIES')) return 'Accessory';
  return 'Mounting';
}

function isVariantCapable(title: string): boolean {
  const t = title.toUpperCase();
  return t.includes('INVERTER') || t.includes('MODULE');
}

export function normalizeSdcRows(rows: SdcSourceRow[]): {
  products: NormalizedProduct[];
  conflicts: ConflictRow[];
  stats: NormalizeStats;
} {
  // 1. enrich
  const enriched = rows.map((r) => ({
    ...r,
    capacity: capacityOf(r.description),
    categorySlug: categoryOf(r.brandSlug, r.sectionTitle),
    typeKeyword: typeKeywordOf(r.sectionTitle),
    variantCapable: isVariantCapable(r.sectionTitle) && !!r.model,
  }));

  // 2. conflict detection: a model code that maps to >1 distinct category
  const catsByModel = new Map<string, Set<string>>();
  for (const r of enriched) {
    if (!r.model) continue;
    const key = r.model.toUpperCase();
    const set = catsByModel.get(key) || new Set<string>();
    if (r.categorySlug) set.add(r.categorySlug);
    catsByModel.set(key, set);
  }
  const conflictModels = new Set<string>();
  for (const [m, cats] of catsByModel) if (cats.size > 1) conflictModels.add(m);

  const conflicts: ConflictRow[] = [];
  const valid = enriched.filter((r) => {
    if (r.model && conflictModels.has(r.model.toUpperCase())) {
      conflicts.push({
        sourceRow: r.sourceRow,
        band: r.band,
        model: r.model,
        description: r.description,
        reason: 'Same model code maps to multiple categories (cross-section collision)',
        sections: [...(catsByModel.get(r.model.toUpperCase()) || new Set())],
      });
      return false;
    }
    return true;
  });

  // 3. SKU classification over non-conflict rows
  const codeCount = new Map<string, number>();
  for (const r of valid) {
    if (!r.model) continue;
    const key = r.model.toUpperCase();
    codeCount.set(key, (codeCount.get(key) || 0) + 1);
  }

  // 4. build drafts
  const drafts = valid.map((r) => {
    let sku: string | null = null;
    if (r.model) {
      const unique = (codeCount.get(r.model.toUpperCase()) || 0) === 1;
      const validSku = VALID_SKU.test(r.model);
      if (unique && validSku) sku = r.model;
    }
    const familyKey = r.variantCapable ? normalizeFamilyModel(r.brandSlug, r.model) : null;
    return {
      sourceRow: r.sourceRow,
      band: r.band,
      sectionTitle: r.sectionTitle,
      brandName: r.brandName,
      brandSlug: r.brandSlug,
      categorySlug: r.categorySlug,
      model: r.model,
      sku,
      capacity: r.capacity,
      familyKey,
      description: r.description,
      specifications: r.specs,
      price: 0,
      priceDisplayMode: 'CONTACT_FOR_PRICE',
      stock: 0,
      condition: 'new',
      status: 'published',
      isActive: true,
      name: '',
      slug: '',
    };
  });

  // 5. deterministic names + unique slugs
  const seen = new Map<string, number>();
  const products: NormalizedProduct[] = drafts.map((p) => {
    const isMounting = p.band === 'D' || p.band === 'E';
    let name: string;
    if (!p.model) {
      name = [p.brandName, p.description].filter(Boolean).join(' ');
    } else if (isMounting) {
      name = [p.brandName, p.description].filter(Boolean).join(' ');
    } else {
      name = [p.brandName, p.model, p.capacity, typeKeywordOf(p.sectionTitle)].filter(Boolean).join(' ');
    }
    let key = slugify(name);
    if (seen.has(key)) {
      name = `${name} ${p.model || p.description}`;
      key = slugify(name);
    }
    seen.set(key, (seen.get(key) || 0) + 1);
    return { ...p, name, slug: key };
  });

  // 6. stats
  const familyKeys = new Map<string, number>();
  for (const p of products) {
    if (!p.familyKey) continue;
    familyKeys.set(p.familyKey, (familyKeys.get(p.familyKey) || 0) + 1);
  }
  const stats: NormalizeStats = {
    total: rows.length,
    products: products.length,
    conflicts: conflicts.length,
    skuAssigned: products.filter((p) => p.sku).length,
    skuNull: products.filter((p) => !p.sku).length,
    skuDuplicate: products.filter((p) => p.model && !p.sku && (codeCount.get(p.model.toUpperCase()) || 0) > 1).length,
    skuInvalid: products.filter((p) => p.model && !p.sku && !VALID_SKU.test(p.model)).length,
    modelNull: products.filter((p) => !p.model).length,
    contactForPrice: products.filter((p) => p.priceDisplayMode === 'CONTACT_FOR_PRICE').length,
    familyCount: familyKeys.size,
    familyMultiMember: [...familyKeys.values()].filter((n) => n > 1).length,
    capacityExtracted: products.filter((p) => p.capacity).length,
  };

  return { products, conflicts, stats };
}

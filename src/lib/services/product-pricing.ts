// Centralized pricing resolver — single source of truth
// All price display decisions flow through this module
// Components MUST NOT read SiteSetting or check priceDisplayMode directly

import { getPrisma } from '@/lib/db';

export type PriceDisplayMode =
  | 'SHOW_PRICE'
  | 'CONTACT_FOR_PRICE'
  | 'REQUEST_QUOTE'
  | 'STARTING_FROM'
  | 'CUSTOM_TEXT';

export interface PriceDisplay {
  mode: PriceDisplayMode;
  label: string;
  showPrice: boolean;
  cta: string | null;
  ctaHref?: string;
  price?: number;
  originalPrice?: number;
}

const SETTING_KEY_MODE = 'product_price_display_mode';
const SETTING_KEY_LABEL = 'product_custom_price_label';

// ═══ Cached global setting (per-request) ═══
let _cachedMode: PriceDisplayMode | null = null;
let _cachedLabel: string | null = null;

export async function getGlobalPriceMode(): Promise<PriceDisplayMode> {
  if (_cachedMode) return _cachedMode;
  try {
    const prisma = await getPrisma();
    const s = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY_MODE } });
    _cachedMode = (s?.value as PriceDisplayMode) || 'SHOW_PRICE';
    return _cachedMode;
  } catch {
    return 'SHOW_PRICE';
  }
}

export async function getGlobalCustomLabel(): Promise<string> {
  if (_cachedLabel) return _cachedLabel;
  try {
    const prisma = await getPrisma();
    const s = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY_LABEL } });
    _cachedLabel = s?.value || '';
    return _cachedLabel;
  } catch {
    return '';
  }
}

/** Clear cache after settings update */
export function clearPricingCache() {
  _cachedMode = null;
  _cachedLabel = null;
}

// ═══ Resolvers ═══

/** Determine the effective price display mode for a product */
export async function resolvePriceDisplayMode(
  product: { priceDisplayMode?: string | null }
): Promise<PriceDisplayMode> {
  if (product.priceDisplayMode && product.priceDisplayMode !== 'null') {
    return product.priceDisplayMode as PriceDisplayMode;
  }
  return getGlobalPriceMode();
}

/** Resolve the full price display for a product */
export async function resolvePriceDisplay(
  product: {
    price: number;
    originalPrice?: number | null;
    priceDisplayMode?: string | null;
    customPriceLabel?: string | null;
    slug?: string;
  }
): Promise<PriceDisplay> {
  const mode = await resolvePriceDisplayMode(product);

  switch (mode) {
    case 'SHOW_PRICE':
      return {
        mode,
        label: `Rp ${product.price.toLocaleString('id-ID')}`,
        showPrice: true,
        cta: null,
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
      };

    case 'STARTING_FROM':
      return {
        mode,
        label: `Mulai dari Rp ${product.price.toLocaleString('id-ID')}`,
        showPrice: true,
        cta: null,
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
      };

    case 'CONTACT_FOR_PRICE':
      return {
        mode,
        label: 'Hubungi Kami untuk Harga',
        showPrice: false,
        cta: 'Hubungi Sales',
        ctaHref: product.slug ? `/permintaan-penawaran?product=${product.slug}` : undefined,
      };

    case 'REQUEST_QUOTE':
      return {
        mode,
        label: 'Harga Berdasarkan Penawaran',
        showPrice: false,
        cta: 'Minta Penawaran',
        ctaHref: product.slug ? `/permintaan-penawaran?product=${product.slug}` : undefined,
      };

    case 'CUSTOM_TEXT':
      return {
        mode,
        label: product.customPriceLabel || await getGlobalCustomLabel() || 'Hubungi Kami',
        showPrice: false,
        cta: null,
      };

    default:
      return {
        mode: 'SHOW_PRICE',
        label: `Rp ${product.price.toLocaleString('id-ID')}`,
        showPrice: true,
        cta: null,
        price: product.price,
        originalPrice: product.originalPrice ?? undefined,
      };
  }
}

// ═══ Helper for legacy code that needs raw price ═══
export async function getDisplayPrice(product: { price: number }): Promise<number> {
  return product.price;
}

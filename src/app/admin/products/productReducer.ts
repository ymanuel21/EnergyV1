// Product editor state — section-based reducer architecture
// Each tab owns one section. Reducer is pure. Validation runs outside.

import { deriveFamilyKey } from '@/lib/product-family';

export interface ProductState {
  overview: {
    name: string;
    slug: string;
    brandId: string;
    sku: string;
    model: string;
    capacity: string;
    stock: number;
    condition: string;
    warranty: string;
    weight: number;
    description: string;
    categoryIds: string[];
  };
  pricing: {
    price: number;
    originalPrice: number | null;
    priceDisplayMode: string;
    customPriceLabel: string;
  };
  media: {
    images: string[];
    badges: string[];  // badge IDs
  };
  specifications: { key: string; value: string }[];
  downloads: { name: string; url: string; type?: string }[];
  related: { relatedProductId: string; type: string }[];
  seo: {
    seoTitle: string;
    metaDescription: string;
  };
  // Dirty tracking per section
  dirtySections: {
    overview: boolean;
    pricing: boolean;
    media: boolean;
    specifications: boolean;
    downloads: boolean;
    related: boolean;
    seo: boolean;
  };
}

export type ProductAction =
  // Overview
  | { type: 'SET_NAME'; value: string }
  | { type: 'SET_SLUG'; value: string }
  | { type: 'SET_BRAND_ID'; value: string }
  | { type: 'SET_SKU'; value: string }
  | { type: 'SET_MODEL'; value: string }
  | { type: 'SET_CAPACITY'; value: string }
  | { type: 'SET_STOCK'; value: number }
  | { type: 'SET_CONDITION'; value: string }
  | { type: 'SET_WARRANTY'; value: string }
  | { type: 'SET_WEIGHT'; value: number }
  | { type: 'SET_DESCRIPTION'; value: string }
  | { type: 'SET_CATEGORY_IDS'; value: string[] }
  // Pricing
  | { type: 'SET_PRICE'; value: number }
  | { type: 'SET_ORIGINAL_PRICE'; value: number | null }
  | { type: 'SET_PRICE_DISPLAY_MODE'; value: string }
  | { type: 'SET_CUSTOM_PRICE_LABEL'; value: string }
  // Media
  | { type: 'SET_IMAGES'; value: string[] }
  | { type: 'SET_BADGES'; value: string[] }
  // Specifications
  | { type: 'SET_SPECS'; value: { key: string; value: string }[] }
  // Downloads
  | { type: 'SET_DOWNLOADS'; value: { name: string; url: string; type?: string }[] }
  // Related
  | { type: 'SET_RELATIONS'; value: { relatedProductId: string; type: string }[] }
  // SEO
  | { type: 'SET_SEO_TITLE'; value: string }
  | { type: 'SET_META_DESCRIPTION'; value: string }
  // Meta
  | { type: 'MARK_CLEAN'; section: keyof ProductState['dirtySections'] }
  | { type: 'RESET'; state: ProductState };

export function productReducer(state: ProductState, action: ProductAction): ProductState {
  const mark = (section: keyof ProductState['dirtySections'], updates: Partial<ProductState>) => ({
    ...state,
    ...updates,
    dirtySections: { ...state.dirtySections, [section]: true },
  });

  switch (action.type) {
    // Overview
    case 'SET_NAME':         return mark('overview', { overview: { ...state.overview, name: action.value } });
    case 'SET_SLUG':         return mark('overview', { overview: { ...state.overview, slug: action.value } });
    case 'SET_BRAND_ID':     return mark('overview', { overview: { ...state.overview, brandId: action.value } });
    case 'SET_SKU':          return mark('overview', { overview: { ...state.overview, sku: action.value } });
    case 'SET_MODEL':        return mark('overview', { overview: { ...state.overview, model: action.value } });
    case 'SET_CAPACITY':     return mark('overview', { overview: { ...state.overview, capacity: action.value } });
    case 'SET_STOCK':        return mark('overview', { overview: { ...state.overview, stock: action.value } });
    case 'SET_CONDITION':    return mark('overview', { overview: { ...state.overview, condition: action.value } });
    case 'SET_WARRANTY':     return mark('overview', { overview: { ...state.overview, warranty: action.value } });
    case 'SET_WEIGHT':       return mark('overview', { overview: { ...state.overview, weight: action.value } });
    case 'SET_DESCRIPTION':  return mark('overview', { overview: { ...state.overview, description: action.value } });
    case 'SET_CATEGORY_IDS': return mark('overview', { overview: { ...state.overview, categoryIds: action.value } });
    // Pricing
    case 'SET_PRICE':              return mark('pricing', { pricing: { ...state.pricing, price: action.value } });
    case 'SET_ORIGINAL_PRICE':     return mark('pricing', { pricing: { ...state.pricing, originalPrice: action.value } });
    case 'SET_PRICE_DISPLAY_MODE': return mark('pricing', { pricing: { ...state.pricing, priceDisplayMode: action.value } });
    case 'SET_CUSTOM_PRICE_LABEL': return mark('pricing', { pricing: { ...state.pricing, customPriceLabel: action.value } });
    // Media
    case 'SET_IMAGES': return mark('media', { media: { ...state.media, images: action.value } });
    case 'SET_BADGES': return mark('media', { media: { ...state.media, badges: action.value } });
    // Specs
    case 'SET_SPECS': return mark('specifications', { specifications: action.value });
    // Downloads
    case 'SET_DOWNLOADS': return mark('downloads', { downloads: action.value });
    // Related
    case 'SET_RELATIONS': return mark('related', { related: action.value });
    // SEO
    case 'SET_SEO_TITLE':        return mark('seo', { seo: { ...state.seo, seoTitle: action.value } });
    case 'SET_META_DESCRIPTION': return mark('seo', { seo: { ...state.seo, metaDescription: action.value } });
    // Meta
    case 'MARK_CLEAN': return { ...state, dirtySections: { ...state.dirtySections, [action.section]: false } };
    case 'RESET': return action.state;
    default: return state;
  }
}

export function makeInitialState(product: any): ProductState {
  const catIds: string[] = product?.categories?.map((pc: any) => pc.categoryId)
    || (product?.categoryId ? [product.categoryId] : []);

  return {
    overview: {
      name: product?.name || '',
      slug: product?.slug || '',
      brandId: product?.brandId || '',
      sku: product?.sku || '',
      model: product?.model || '',
      capacity: product?.capacity || '',
      stock: product?.stock ?? 0,
      condition: product?.condition || 'new',
      warranty: product?.warranty || '1 Tahun',
      weight: product?.weight ?? 0,
      description: product?.description || '',
      categoryIds: catIds,
    },
    pricing: {
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice ?? null,
      priceDisplayMode: product?.priceDisplayMode || '',
      customPriceLabel: product?.customPriceLabel || '',
    },
    media: {
      images: Array.isArray(product?.images) ? product.images : [],
      badges: product?.badges || [],
    },
    specifications: product?.specifications || [],
    downloads: product?.downloads || [],
    related: (product?.relations || []).map((r: any) => ({ relatedProductId: r.relatedProductId, type: r.type })),
    seo: {
      seoTitle: product?.seoTitle || '',
      metaDescription: product?.metaDescription || '',
    },
    dirtySections: {
      overview: false, pricing: false, media: false,
      specifications: false, downloads: false, related: false, seo: false,
    },
  };
}

/** Build API payload from state (serialized for saveDraft / publish). */
export function buildPayload(state: ProductState, productId?: string, brandSlug?: string | null) {
  return {
    name: state.overview.name,
    slug: state.overview.slug,
    brandId: state.overview.brandId,
    sku: state.overview.sku || null,
    model: state.overview.model || null,
    capacity: state.overview.capacity || null,
    familyKey: deriveFamilyKey(brandSlug, state.overview.model),
    stock: state.overview.stock,
    condition: state.overview.condition,
    warranty: state.overview.warranty,
    weight: state.overview.weight,
    description: state.overview.description,
    categoryIds: state.overview.categoryIds,
    categoryId: state.overview.categoryIds[0] || null,
    price: state.pricing.price,
    originalPrice: state.pricing.originalPrice,
    priceDisplayMode: state.pricing.priceDisplayMode || undefined,
    customPriceLabel: state.pricing.customPriceLabel || undefined,
    images: state.media.images.length > 0 ? state.media.images : ['/images/placeholder/product-placeholder.png'],
    badges: state.media.badges,
    badgeIds: state.media.badges,
    specifications: state.specifications.filter(s => s.key?.trim()),
    downloads: state.downloads,
    relations: state.related,
    seoTitle: state.seo.seoTitle || undefined,
    metaDescription: state.seo.metaDescription || undefined,
    isActive: true,
  };
}

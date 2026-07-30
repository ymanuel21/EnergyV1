import type { FC } from 'react';
import { ProductShowcase } from '@components/home/ProductShowcase';
import { ProductCardItem } from '@components/home/ProductCardItem';

export interface SectionRendererProps {
  section: {
    id: string;
    type: string;
    enabled: boolean;
    status?: string;
    sortOrder: number;
    title?: string | null;
    subtitle?: string | null;
    settings: Record<string, unknown>;
  };
  data?: {
    products?: any[];
    brands?: any[];
    banners?: any[];
    projects?: any[];
    productsById?: Record<string, any>;
    priceLabels?: Map<string, string | undefined>;
  };
}

export type SectionField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'toggle' | 'select' | 'image' | 'alignment' | 'color' | 'product-picker';
  options?: { value: string; label: string }[];
  group?: 'content' | 'styling' | 'advanced';
  defaultValue?: any;
  placeholder?: string;
  showWhen?: Record<string, string>;  // conditional visibility: { source: 'manual' }
  min?: number;                         // min value for number fields
}

export interface SectionDefinition {
  type: string;
  label: string;
  icon: string;
  defaultSettings: Record<string, unknown>;
  fields: SectionField[];
  Renderer: FC<SectionRendererProps>;
}

// ══════════════════════════════════════════════
// Section Registry — single source of truth.
// Both Admin Builder and Frontend renderer consume this.
// ══════════════════════════════════════════════

const COMMON_ADVANCED: SectionField[] = [
  { key: '_visibility', label: 'Visibility', type: 'select', options: [{ value: 'all', label: 'All Devices' }, { value: 'desktop', label: 'Desktop Only' }, { value: 'mobile', label: 'Mobile Only' }], group: 'advanced', defaultValue: 'all' },
  { key: '_padding', label: 'Padding', type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'spacious', label: 'Spacious' }], group: 'advanced', defaultValue: 'default' },
  { key: '_container', label: 'Container Width', type: 'select', options: [{ value: 'boxed', label: 'Boxed' }, { value: 'wide', label: 'Wide' }, { value: 'full', label: 'Full Width' }], group: 'advanced', defaultValue: 'boxed' },
  { key: '_background', label: 'Background', type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'white', label: 'White' }, { value: 'gray', label: 'Gray' }, { value: 'none', label: 'Transparent' }], group: 'advanced', defaultValue: 'default' },
  { key: '_textColor', label: 'Text Color', type: 'select', options: [{ value: 'auto', label: 'Auto' }], group: 'advanced', defaultValue: '' },
  { key: '_borderRadius', label: 'Border Radius', type: 'select', options: [{ value: 'square', label: 'Square' }], group: 'advanced', defaultValue: 'medium' },
  { key: '_shadow', label: 'Shadow', type: 'select', options: [{ value: 'none', label: 'None' }], group: 'advanced', defaultValue: 'none' },
  { key: '_animation', label: 'Animation', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'slide', label: 'Slide Up' }], group: 'advanced', defaultValue: 'none' },
  { key: '_cssClass', label: 'CSS Class', type: 'text', group: 'advanced', defaultValue: '', placeholder: 'custom-class' },
  { key: '_anchorId', label: 'Anchor ID', type: 'text', group: 'advanced', defaultValue: '', placeholder: 'section-id' },
];

export const sectionRegistry: Record<string, SectionDefinition> = {
  // ── Hero ──
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: '🏠',
    defaultSettings: {
      tagline: 'Energi Terbarukan',
      description: 'Produk berkualitas premium.',
      cta: 'Jelajahi Katalog',
      ctaLink: '/produk',
      secondaryCta: 'Minta Penawaran',
      secondaryCtaLink: '/permintaan-penawaran',
      bgImage: '',
      overlayColor: '#000000',
      overlayOpacity: 0,
      alignment: 'left',
      height: 'medium',
      showSearch: false,
      showCategories: false,
      showStats: false,
    },
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text', group: 'content' },
      { key: 'description', label: 'Description', type: 'textarea', group: 'content' },
      { key: 'cta', label: 'Primary Button', type: 'text', group: 'content' },
      { key: 'ctaLink', label: 'Primary Link', type: 'text', group: 'content' },
      { key: 'secondaryCta', label: 'Secondary Button', type: 'text', group: 'content' },
      { key: 'secondaryCtaLink', label: 'Secondary Link', type: 'text', group: 'content' },
      { key: 'bgImage', label: 'Background Image', type: 'image', group: 'styling' },
      { key: 'overlayColor', label: 'Overlay Color', type: 'color', group: 'styling' },
      { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'number', group: 'styling' },
      { key: 'alignment', label: 'Alignment', type: 'alignment', group: 'styling' },
      { key: 'height', label: 'Height', type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }], group: 'styling' },
      { key: 'showSearch', label: 'Show Search Bar', type: 'toggle', group: 'styling' },
      { key: 'showCategories', label: 'Show Categories', type: 'toggle', group: 'styling' },
      { key: 'showStats', label: 'Show Statistics', type: 'toggle', group: 'styling' },
      ...COMMON_ADVANCED,
    ],
    Renderer: HeroRenderer,
  },

  // ── Category Grid ──
  'category-grid': {
    type: 'category-grid',
    label: 'Category Grid',
    icon: '📂',
    defaultSettings: { source: 'auto', columns: 4, cardStyle: 'image', maxCategories: 8, showViewAll: true, viewAllLabel: 'Lihat Semua Kategori', viewAllLink: '/kategori' },
    fields: [
      { key: 'source', label: 'Content Source', type: 'select', options: [{ value: 'auto', label: 'Automatic' }, { value: 'manual', label: 'Manual' }], group: 'content' },
      { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4', '5'].map(v => ({ value: v, label: v })), group: 'styling' },
      { key: 'cardStyle', label: 'Card Style', type: 'select', options: [{ value: 'image', label: 'Image' }, { value: 'icon', label: 'Icon' }, { value: 'minimal', label: 'Minimal' }], group: 'styling' },
      { key: 'maxCategories', label: 'Max Categories', type: 'number', group: 'content' },
      { key: 'showViewAll', label: 'Show View All', type: 'toggle', group: 'content' },
      { key: 'viewAllLabel', label: 'View All Label', type: 'text', group: 'content' },
      { key: 'viewAllLink', label: 'View All Link', type: 'text', group: 'content' },
      ...COMMON_ADVANCED,
    ],
    Renderer: CategoryGridRenderer,
  },

  // ── Featured Products ──
  'featured-products': {
    type: 'featured-products',
    label: 'Featured Products',
    icon: '⭐',
    defaultSettings: {
      source: 'featured', maxProducts: 4, layout: 'grid',
      showPrice: true, showBadge: true, showCompare: true, showWishlist: true,
      buttonLabel: 'Lihat Semua', buttonLink: '/produk',
    },
    fields: [
      { key: 'source', label: 'Content Source', type: 'select', options: [
        { value: 'latest', label: 'Latest Products' }, { value: 'featured', label: 'Featured' },
        { value: 'bestseller', label: 'Best Sellers' }, { value: 'highest_rated', label: 'Highest Rated' },
        { value: 'new_arrival', label: 'New Arrivals' }, { value: 'manual', label: 'Manual Selection' },
      ], group: 'content' },
      { key: 'productIds', label: 'Featured Products', type: 'product-picker', group: 'content', showWhen: { source: 'manual' } },
      { key: 'maxProducts', label: 'Max Products', type: 'number', group: 'content', min: 1, defaultValue: 4 },
      { key: 'layout', label: 'Layout', type: 'select', options: [{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }], group: 'styling' },
      { key: 'showPrice', label: 'Show Price', type: 'toggle', group: 'styling' },
      { key: 'showBadge', label: 'Show Badge', type: 'toggle', group: 'styling' },
      { key: 'showCompare', label: 'Show Compare', type: 'toggle', group: 'styling' },
      { key: 'showWishlist', label: 'Show Wishlist', type: 'toggle', group: 'styling' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text', group: 'content' },
      { key: 'buttonLink', label: 'Button Link', type: 'text', group: 'content' },
      ...COMMON_ADVANCED,
    ],
    Renderer: FeaturedProductsRenderer,
  },

  // ── Brands ──
  brands: {
    type: 'brands',
    label: 'Brands',
    icon: '🏢',
    defaultSettings: { source: 'auto', display: 'grid', columns: 4, rows: 2, showViewAll: true },
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [{ value: 'auto', label: 'Automatic (All)' }, { value: 'manual', label: 'Manual Selection' }], group: 'content' },
      { key: 'display', label: 'Display Style', type: 'select', options: [{ value: 'grid', label: 'Grid' }, { value: 'marquee', label: 'Marquee' }], group: 'styling' },
      { key: 'columns', label: 'Columns', type: 'number', group: 'styling' },
      { key: 'rows', label: 'Rows', type: 'number', group: 'styling' },
      { key: 'showViewAll', label: 'Show View All', type: 'toggle', group: 'content' },
      ...COMMON_ADVANCED,
    ],
    Renderer: BrandsRenderer,
  },

  // ── Projects ──
  projects: {
    type: 'projects',
    label: 'Projects',
    icon: '☀️',
    defaultSettings: { source: 'latest', maxProjects: 6, showCustomer: true, showCapacity: true, showYear: true, showLocation: true, buttonLabel: 'Lihat Proyek', buttonLink: '/proyek' },
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [{ value: 'latest', label: 'Latest' }, { value: 'featured', label: 'Featured' }, { value: 'manual', label: 'Manual' }], group: 'content' },
      { key: 'maxProjects', label: 'Max Projects', type: 'number', group: 'content' },
      { key: 'showCustomer', label: 'Show Customer', type: 'toggle', group: 'styling' },
      { key: 'showCapacity', label: 'Show Capacity', type: 'toggle', group: 'styling' },
      { key: 'showYear', label: 'Show Year', type: 'toggle', group: 'styling' },
      { key: 'showLocation', label: 'Show Location', type: 'toggle', group: 'styling' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text', group: 'content' },
      { key: 'buttonLink', label: 'Button Link', type: 'text', group: 'content' },
      ...COMMON_ADVANCED,
    ],
    Renderer: ProjectsRenderer,
  },

  // ── Testimonials ──
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    icon: '💬',
    defaultSettings: { source: 'latest', maxTestimonials: 6, cardLayout: 'card', showRating: true, showCompany: true, autoRotate: false },
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [{ value: 'latest', label: 'Latest' }, { value: 'featured', label: 'Featured' }, { value: 'manual', label: 'Manual' }], group: 'content' },
      { key: 'maxTestimonials', label: 'Max Testimonials', type: 'number', group: 'content' },
      { key: 'cardLayout', label: 'Card Layout', type: 'select', options: [{ value: 'compact', label: 'Compact' }, { value: 'card', label: 'Card' }, { value: 'large', label: 'Large' }], group: 'styling' },
      { key: 'showRating', label: 'Show Rating', type: 'toggle', group: 'styling' },
      { key: 'showCompany', label: 'Show Company', type: 'toggle', group: 'styling' },
      { key: 'autoRotate', label: 'Auto Rotate', type: 'toggle', group: 'styling' },
      ...COMMON_ADVANCED,
    ],
    Renderer: TestimonialsRenderer,
  },

  // ── CTA ──
  cta: {
    type: 'cta',
    label: 'CTA',
    icon: '📣',
    defaultSettings: { buttonLabel: 'Konsultasi Gratis', buttonLink: '/permintaan-penawaran', secondaryButtonLabel: '', secondaryButtonLink: '', bgImage: '', bgColor: '#111827', alignment: 'center', padding: 'medium' },
    fields: [
      { key: 'buttonLabel', label: 'Primary Button', type: 'text', group: 'content' },
      { key: 'buttonLink', label: 'Primary Link', type: 'text', group: 'content' },
      { key: 'secondaryButtonLabel', label: 'Secondary Button', type: 'text', group: 'content' },
      { key: 'secondaryButtonLink', label: 'Secondary Link', type: 'text', group: 'content' },
      { key: 'bgImage', label: 'Background Image', type: 'image', group: 'styling' },
      { key: 'bgColor', label: 'Background Color', type: 'color', group: 'styling' },
      { key: 'alignment', label: 'Alignment', type: 'alignment', group: 'styling' },
      { key: 'padding', label: 'Padding', type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }], group: 'styling' },
      ...COMMON_ADVANCED,
    ],
    Renderer: CtaRenderer,
  },
};

export const sectionTypes = Object.values(sectionRegistry);

/* ===== HELPERS ===== */

const PADDING_MAP: Record<string, string> = { compact: 'py-8', default: 'py-16 sm:py-24', spacious: 'py-24 sm:py-40' };
const CONTAINER_MAP: Record<string, string> = { boxed: 'max-w-5xl px-4 sm:px-8', wide: 'max-w-[90rem] px-4 sm:px-8', full: 'px-0' };
const ANIMATION_MAP: Record<string, string> = { fade: 'animate-fadeIn', slide: 'animate-slideUp', none: '' };

/** Single source of truth for all color values — used by both editor and frontend */
export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; label: string }> = {
  default:    { bg: 'bg-card',          text: 'text-primary',   border: 'border-border',       label: 'Default' },
  white:      { bg: 'bg-white',         text: 'text-gray-900',  border: 'border-border',       label: 'White' },
  gray:       { bg: 'bg-surface',       text: 'text-gray-700',  border: 'border-border',       label: 'Gray' },
  dark:       { bg: 'bg-gray-900',      text: 'text-white',     border: 'border-gray-700',     label: 'Dark' },
  primary:    { bg: 'bg-primary',       text: 'text-white',     border: 'border-primary',      label: 'Primary' },
  secondary:  { bg: 'bg-amber-500',     text: 'text-white',     border: 'border-amber-500',    label: 'Secondary' },
  accent:     { bg: 'bg-emerald-500',   text: 'text-white',     border: 'border-emerald-500',  label: 'Accent' },
  none:       { bg: 'bg-transparent',   text: 'text-primary',   border: 'border-border',       label: 'Transparent' },
};
const BG_MAP: Record<string, string> = Object.fromEntries(Object.entries(COLOR_MAP).map(([k, v]) => [k, v.bg]));
const TEXT_COLOR_MAP: Record<string, string> = Object.fromEntries(Object.entries(COLOR_MAP).map(([k, v]) => [k, v.text]));

function SectionWrapper({ section, children }: { section: any; children: React.ReactNode }) {
  const s = section.settings || {};
  const visibility = s._visibility || 'all';
  const padding = PADDING_MAP[s._padding || 'default'] || PADDING_MAP.default;
  const container = CONTAINER_MAP[s._container || 'boxed'] || CONTAINER_MAP.boxed;
  const bgValue = s._background || 'default';
  const isHex = /^#[0-9a-fA-F]{3,8}$/.test(bgValue);
  const bg = isHex ? '' : (BG_MAP[bgValue] || BG_MAP.default);
  const bgStyle = isHex ? { backgroundColor: bgValue } : undefined;
  const textColor = s._textColor ? TEXT_COLOR_MAP[s._textColor] || '' : '';
  const anim = ANIMATION_MAP[s._animation || 'none'] || '';
  const cssClass = s._cssClass || '';
  const anchorId = s._anchorId || '';

  const wrapperClasses = `${bg} ${padding} ${anim} ${cssClass} ${textColor}`.trim();

  if (visibility === 'desktop') return <section className={`hidden sm:block ${wrapperClasses}`} id={anchorId || undefined} style={bgStyle}><div className={`mx-auto ${container}`}>{children}</div></section>;
  if (visibility === 'mobile')  return <section className={`block sm:hidden ${wrapperClasses}`} id={anchorId || undefined} style={bgStyle}><div className={`mx-auto ${container}`}>{children}</div></section>;
  return <section className={wrapperClasses} id={anchorId || undefined} style={bgStyle}><div className={`mx-auto ${container}`}>{children}</div></section>;
}

/* ===== RENDERERS ===== */
import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
function HeroRenderer({ section, data }: SectionRendererProps) {
  const banner = data?.banners?.[0];
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF5 40%, #F5F5F0 100%)' }}>
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-50/50 blur-3xl" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[.25em] text-muted">{String(section.settings.tagline || 'Energi Terbarukan')}</p>
          <h1 className="mt-4 text-3xl font-light leading-tight tracking-tight text-primary sm:mt-6 sm:text-4xl lg:text-6xl">
            {section.title || 'Tenaga surya'}<br />
            <span className="font-semibold">{section.subtitle || 'untuk semua.'}</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted max-w-md sm:mt-8 sm:text-lg">{String(section.settings.description || 'Produk berkualitas premium.')}</p>
          <div className="mt-6 flex flex-col gap-2 sm:mt-10 sm:flex-row sm:gap-3">
            <Link href={String(section.settings.ctaLink || '/produk')} className="rounded-full bg-dark-bg px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 shadow-lg text-center transition sm:px-8 sm:py-3.5">
              {String(section.settings.cta || 'Jelajahi Katalog')}
            </Link>
            <Link href="/permintaan-penawaran" className="rounded-full px-6 py-3 text-sm font-medium text-muted hover:text-primary text-center transition sm:px-8 sm:py-3.5">Minta Penawaran →</Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-3xl bg-card shadow-2xl shadow-gray-900/5 ring-1 ring-gray-900/5">
            <img src={banner?.image || banner?.src || '/images/prototype/hero-power-station.png'} alt={banner?.alt || 'Hero'} className="h-full w-full object-contain p-8" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryGridRenderer({ section }: SectionRendererProps) {
  const TOP_CATEGORIES = [
    { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial — efisiensi tinggi untuk setiap kebutuhan', s:'panel-surya' },
    { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro — konversi daya yang andal', s:'inverter' },
    { n:'Baterai', d:'Lithium LiFePO4, Rack Mounted, Wall, All-in-One ESS', s:'baterai' },
    { n:'Paket PLTS', d:'Solusi lengkap untuk rumah, kantor, dan industri', s:'paket-plts' },
  ];
  return (
    <section className="relative bg-card py-16 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-4">{section.title}</p>}
        {section.subtitle && <h2 className="text-3xl font-light tracking-tight lg:text-4xl">{section.subtitle}</h2>}
        <div className="mt-16 grid gap-0 divide-y divide-gray-100">
          {TOP_CATEGORIES.map((cat,i) => (
            <Link key={cat.s} href={`/kategori/${cat.s}`} className="group flex cursor-pointer items-center justify-between py-8 transition hover:bg-surface/50 -mx-4 px-4 rounded-xl">
              <div>
                <span className="text-xs text-gray-200 mr-3 font-mono">0{i+1}</span>
                <h3 className="inline text-xl font-medium">{cat.n}</h3>
                <p className="mt-2 text-sm text-muted max-w-xl">{cat.d}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-2xl text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsRenderer({ section, data }: SectionRendererProps) {
  const products = data?.products || [];
  const productIds: string[] = Array.isArray(section.settings.productIds) ? section.settings.productIds as string[] : [];
  const max = Number(section.settings.maxProducts) || 4;

  // Manual selection: filter by productIds, preserve order
  const featured = productIds.length
    ? productIds.map(id => products.find((p: any) => p.slug === id || p.id === id)).filter(Boolean).slice(0, max)
    : products.slice(0, max);

  if (!featured.length) return null;

  // Use pre-resolved price labels from data (resolved by homepage server)
  const priceLabels: Map<string, string | undefined> = data?.priceLabels || new Map();

  const layout = section.settings.layout || 'grid';
  const showPrice = section.settings.showPrice !== false;
  const showBadge = section.settings.showBadge !== false;

  const isManualSelection = productIds.length > 0;
  const adaptiveLayout = isManualSelection && featured.length < 4;

  return (
    <section className="relative py-16 sm:py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-2">{section.title}</p>}
        {section.subtitle && <h2 className="text-2xl font-light tracking-tight mb-8">{section.subtitle}</h2>}

        {adaptiveLayout ? (
          /* Product Showcase: 1p large card + panel, 2-3p rotate + panel */
          <ProductShowcase
            products={featured}
            featuredCount={featured.length}
            showPrice={showPrice}
            showBadge={showBadge}
            priceLabels={priceLabels}
          />
        ) : (
          /* Standard grid layout (4+ products or auto-source) */
          <>
            <div className={layout === 'carousel'
              ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'}>
              {featured.map((p: any) => (
                <ProductCardItem key={p.id || p.slug} product={p} showPrice={showPrice} showBadge={showBadge} priceLabels={priceLabels} featuredCount={4} />
              ))}
            </div>
          </>
        )}

        {!!section.settings.buttonLabel && (
          <div className="mt-8 text-center">
            <Link href={String(section.settings.buttonLink || '/produk')}
              className="inline-block rounded-full border border-border px-6 py-2.5 text-sm text-muted hover:text-primary hover:border-primary transition">
              {String(section.settings.buttonLabel)}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function BrandsRenderer({ section, data }: SectionRendererProps) {
  const brands = data?.brands || [];
  return (
    <section className="bg-card py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title || 'Brand Resmi'}</p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-30">
          {brands.slice(0, 8).map((b: any) => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="text-sm font-bold tracking-wider text-muted hover:opacity-70 transition">{b.name}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaRenderer({ section }: SectionRendererProps) {
  return (
    <section className="relative overflow-hidden bg-dark-bg">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl px-4 sm:px-8 py-16 sm:py-32 text-center">
        <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl lg:text-4xl">{section.title || 'Butuh bantuan?'}</h2>
        {section.subtitle && <p className="mt-4 text-base text-muted sm:mt-6 sm:text-lg">{section.subtitle}</p>}
        <Link href={String(section.settings.buttonLink || '/permintaan-penawaran')} className="mt-6 inline-block rounded-full bg-card px-6 py-3 text-sm font-medium text-primary hover:bg-gray-100 shadow-lg transition sm:mt-8 sm:px-10 sm:py-4">
          {String(section.settings.buttonLabel || 'Konsultasi Gratis')}
        </Link>
      </div>
    </section>
  );
}

/* ===== NEW SECTION TYPES ===== */

function ProjectsRenderer({ section, data }: SectionRendererProps) {
  const projects = data?.projects || [];
  if (!projects.length) return null;
  const s = section.settings || {};
  const max = Number(s.maxProjects) || 6;
  return (
    <SectionWrapper section={section}>
      {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, max).map((p: any) => (
          <Link key={p.id} href={`/proyek/${p.slug}`}
            className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition">
            {(p.coverImage || (Array.isArray(p.images) && p.images[0])) ? (
              <div className="aspect-[4/3] overflow-hidden bg-surface">
                <img src={p.coverImage || p.images[0]} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center bg-surface text-3xl text-muted">☀️</div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-primary text-sm line-clamp-2">{p.title}</h4>
              <p className="text-xs text-muted mt-1">
                {s.showLocation !== false && p.location}{s.showLocation !== false && s.showCapacity !== false && p.location && p.capacity ? ' · ' : ''}
                {s.showCapacity !== false && p.capacity}
              </p>
              <p className="text-xs text-muted">
                {s.showCustomer !== false && p.customer}{s.showCustomer !== false && s.showYear !== false && p.customer && p.year ? ' · ' : ''}
                {s.showYear !== false && p.year}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

function TestimonialsRenderer({ section, data }: SectionRendererProps) {
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title}</p>}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="flex mb-3">{'⭐'.repeat(5)}</div>
              <p className="text-sm text-muted italic">&ldquo;Produk berkualitas, pemasangan profesional.&rdquo;</p>
              <p className="text-xs text-primary mt-3 font-medium">Customer {i}</p>
              <p className="text-xs text-muted">Company · Role</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


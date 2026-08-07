import type { FC } from 'react';
import { ProductShowcase } from '@components/home/ProductShowcase';

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
  showWhen?: Record<string, string>;  // conditional visibility: { source: 'manual' }
  min?: number;                         // min value for number fields
  single?: boolean;                     // single-select mode for product-picker
  searchApi?: string;                   // custom search endpoint for product-picker
  placeholder?: string;
  displayFields?: Record<string, string>; // field mapping for product-picker (name→title, etc)
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
  { key: '_animation', label: 'Animation', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'slide', label: 'Slide Up' }, { value: 'slideDown', label: 'Slide Down' }, { value: 'zoom', label: 'Zoom In' }], group: 'advanced', defaultValue: 'none' },
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
      heroProductId: '',
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
      { key: 'heroProductId', label: 'Hero Product', type: 'product-picker', group: 'content', single: true },
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
      source: 'manual', maxProducts: 1, layout: 'showcase',
      showPrice: true, showBadge: true,
      showDescription: true, showSpecifications: true, showShipping: true,
      buttonLabel: 'Lihat Semua Produk', buttonLink: '/produk',
    },
    fields: [
      { key: 'source', label: 'Content Source', type: 'select', options: [
        { value: 'manual', label: 'Manual Selection' },
        { value: 'latest', label: 'Latest Products' }, { value: 'featured', label: 'Featured' },
        { value: 'bestseller', label: 'Best Sellers' }, { value: 'highest_rated', label: 'Highest Rated' },
        { value: 'new_arrival', label: 'New Arrivals' },
      ], group: 'content' },
      { key: 'productIds', label: 'Featured Products', type: 'product-picker', group: 'content', showWhen: { source: 'manual' } },
      { key: 'maxProducts', label: 'Max Products to Show', type: 'number', group: 'content', min: 1, defaultValue: 4 },
      { key: 'showPrice', label: 'Show Price', type: 'toggle', group: 'styling' },
      { key: 'showBadge', label: 'Show Badge', type: 'toggle', group: 'styling' },
      { key: 'showDescription', label: 'Description Tab', type: 'toggle', group: 'styling' },
      { key: 'showSpecifications', label: 'Specifications Tab', type: 'toggle', group: 'styling' },
      { key: 'showShipping', label: 'Shipping & Warranty Tab', type: 'toggle', group: 'styling' },
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
    defaultSettings: {
      source: 'latest', maxGridProjects: 3,
      showCustomer: true, showCapacity: true, showYear: true, showLocation: true,
      eyebrow: 'Project Referensi', heading: 'Energi Terbarukan untuk Semua.',
      subheading: 'Jelajahi proyek energi terbarukan yang telah kami selesaikan di berbagai sektor.',
      buttonLabel: 'Lihat Semua Proyek', buttonLink: '/proyek',
      featuredProjectId: [], gridProjectIds: [],
      heroTitleOverride: '', heroDescriptionOverride: '',
    },
    fields: [
      { key: 'eyebrow', label: 'Eyebrow', type: 'text', group: 'content' },
      { key: 'heading', label: 'Heading', type: 'text', group: 'content' },
      { key: 'subheading', label: 'Description', type: 'textarea', group: 'content' },
      { key: 'source', label: 'Content Source', type: 'select', options: [{ value: 'latest', label: 'Latest Projects' }, { value: 'manual', label: 'Manual Selection' }], group: 'content' },
      { key: 'featuredProjectId', label: 'Featured Project', type: 'product-picker', group: 'content', showWhen: { source: 'manual' }, single: true, searchApi: '/api/admin/search-projects', placeholder: 'Cari proyek unggulan...', displayFields: { name: 'title', image: 'coverImage', subtitle: 'category', category: 'location', slug: 'slug' } },
      { key: 'heroTitleOverride', label: 'Hero Title Override', type: 'text', group: 'content', showWhen: { source: 'manual' }, placeholder: 'Override title (empty = use project title)' },
      { key: 'heroDescriptionOverride', label: 'Hero Description Override', type: 'textarea', group: 'content', showWhen: { source: 'manual' }, placeholder: 'Override description (empty = use project description)' },
      { key: 'gridProjectIds', label: 'Additional Projects', type: 'product-picker', group: 'content', showWhen: { source: 'manual' }, searchApi: '/api/admin/search-projects', placeholder: 'Cari proyek...', displayFields: { name: 'title', image: 'coverImage', subtitle: 'category', category: 'location', slug: 'slug' } },
      { key: 'maxGridProjects', label: 'Max Grid Projects', type: 'number', group: 'content', min: 1 },
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
    defaultSettings: { source: 'latest', maxTestimonials: 6, cardLayout: 'card', showRating: true, showCompany: true, autoRotate: false, buttonLabel: 'Lihat Semua Testimoni', buttonLink: '/testimoni' },
    fields: [
      { key: 'source', label: 'Source', type: 'select', options: [{ value: 'latest', label: 'Latest' }, { value: 'featured', label: 'Featured' }, { value: 'manual', label: 'Manual' }], group: 'content' },
      { key: 'maxTestimonials', label: 'Max Testimonials', type: 'number', group: 'content' },
      { key: 'cardLayout', label: 'Card Layout', type: 'select', options: [{ value: 'compact', label: 'Compact' }, { value: 'card', label: 'Card' }, { value: 'large', label: 'Large' }], group: 'styling' },
      { key: 'showRating', label: 'Show Rating', type: 'toggle', group: 'styling' },
      { key: 'showCompany', label: 'Show Company', type: 'toggle', group: 'styling' },
      { key: 'autoRotate', label: 'Auto Rotate', type: 'toggle', group: 'styling' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text', group: 'content' },
      { key: 'buttonLink', label: 'Button Link', type: 'text', group: 'content' },
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
const ANIMATION_MAP: Record<string, string> = { none: '', fade: 'animate-fade-in', slide: 'animate-slide-up', slideDown: 'animate-slide-down', zoom: 'animate-scale-in' };

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
  const productIdRaw = section.settings.heroProductId;
  const productId = Array.isArray(productIdRaw) ? productIdRaw[0] : productIdRaw;
  const heroProduct = productId ? data?.products?.find((p: any) => p.slug === productId || p.id === productId) : null;
  const heroImage = heroProduct?.images?.[0] || section.settings.imageId || '/images/prototype/hero-power-station.png';
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
            <img src={heroImage} alt={heroProduct?.name || section.settings.title || 'Hero'} className="h-full w-full object-contain p-8" />
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
  const showDescription = section.settings.showDescription !== false;
  const showSpecifications = section.settings.showSpecifications !== false;
  const showShipping = section.settings.showShipping !== false;

  const isManualSelection = productIds.length > 0;
  const useShowcase = isManualSelection && featured.length > 0;

  return (
    <section className="relative py-16 sm:py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-2">{section.title}</p>}
        {section.subtitle && <h2 className="text-2xl font-light tracking-tight mb-8">{section.subtitle}</h2>}

        {useShowcase ? (
          <ProductShowcase
            products={featured}
            showPrice={showPrice}
            showBadge={showBadge}
            showDescription={showDescription}
            showSpecifications={showSpecifications}
            showShipping={showShipping}
            priceLabels={priceLabels}
          />
        ) : (
          <div className={layout === 'carousel'
            ? 'flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory'
            : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'}>
            {featured.map((p: any) => (
              <Link key={p.id || p.slug} href={`/produk/${p.slug}`}
                className={`group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition ${layout === 'carousel' ? 'shrink-0 w-[280px] snap-start' : ''}`}>
                <div className="aspect-square overflow-hidden bg-surface">
                  <SafeImage src={p.images?.[0] || ''} alt={p.name} width={400} height={400}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-primary line-clamp-2">{p.name}</h3>
                  {showPrice && (
                    <div className="mt-2 flex items-baseline gap-2">
                      {priceLabels.get(p.id) ? (
                        <span className="text-sm text-muted">{priceLabels.get(p.id)}</span>
                      ) : (
                        <>
                          <span className="text-base font-semibold">Rp {p.price?.toLocaleString('id-ID')}</span>
                          {p.originalPrice > p.price && (
                            <span className="text-xs text-muted line-through">Rp {p.originalPrice?.toLocaleString('id-ID')}</span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {showBadge && p.badgeRelations?.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {p.badgeRelations.slice(0, 2).map((br: any) => (
                        <span key={br.badge?.slug || br.badge?.name}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: (br.badge as any)?.bgColor || '#f0f0f0', color: (br.badge as any)?.color || '#333' }}>
                          {(br.badge as any)?.name as string}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
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
        <div className="flex flex-wrap items-center justify-center gap-4">
          {brands.slice(0, 12).map((b: any) => (
            <Link key={b.id} href={`/brand/${b.slug}`}
              className="group inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold tracking-wide text-gray-600 transition-all duration-200 hover:border-black hover:bg-black hover:text-white hover:shadow-md">
              {b.name}
            </Link>
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
  const s = section.settings || {};
  let projects = data?.projects || [];

  // Manual selection
  const featuredId = Array.isArray(s.featuredProjectId) ? (s.featuredProjectId as string[])[0] : (s.featuredProjectId as string);
  const gridIds: string[] = (s.gridProjectIds as string[]) || [];
  const maxGrid = Number(s.maxGridProjects) || 3;

  if (s.source === 'manual') {
    // Resolve featured project
    const featured = featuredId ? projects.find((p: any) => p.slug === featuredId || p.id === featuredId) : null;
    // Resolve grid projects in order
    const grid = gridIds
      .map((id: string) => projects.find((p: any) => p.slug === id || p.id === id))
      .filter(Boolean)
      .slice(0, maxGrid);

    if (!featured && grid.length === 0) return null;

    const heroTitle = (s.heroTitleOverride as string) || featured?.title || '';
    const heroDesc = (s.heroDescriptionOverride as string) || featured?.shortDescription || '';

    return (
      <SectionWrapper section={section}>
        <div className="mb-12 text-center max-w-2xl mx-auto">
          {s.eyebrow ? <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-4">{s.eyebrow as string}</p> : null}
          {s.heading ? <h2 className="text-3xl font-light tracking-tight lg:text-4xl mb-4">{s.heading as string}</h2> : null}
          {s.subheading ? <p className="text-base text-muted leading-relaxed">{s.subheading as string}</p> : null}
        </div>

        {featured && (
          <Link href={`/proyek/${featured.slug}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-surface">
                {(featured.coverImage || (Array.isArray(featured.images) && featured.images[0])) ? (
                  <img src={featured.coverImage || featured.images[0]} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 text-6xl">☀️</div>
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {featured.category && <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-700">{featured.category}</span>}
                  {featured.year && <span className="text-xs text-muted">{featured.year}</span>}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-primary group-hover:text-primary-hover transition-colors">
                  {heroTitle}
                </h3>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                  {s.showLocation !== false && featured.location && <span className="inline-flex items-center gap-1.5">📍 {featured.location}</span>}
                  {s.showCapacity !== false && featured.capacity && <span className="inline-flex items-center gap-1.5">⚡ {featured.capacity}</span>}
                  {s.showCustomer !== false && featured.customer && <span className="inline-flex items-center gap-1.5">🏢 {featured.customer}</span>}
                </div>
                {heroDesc && <p className="mt-4 text-sm text-muted leading-relaxed line-clamp-3">{heroDesc}</p>}
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">Lihat Detail Proyek <span className="text-lg">→</span></span>
              </div>
            </div>
          </Link>
        )}

        {grid.length > 0 && (
          <div className="mt-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((p: any) => (
                <Link key={p.id} href={`/proyek/${p.slug}`} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="aspect-[16/10] overflow-hidden bg-surface">
                    {(p.coverImage || (Array.isArray(p.images) && p.images[0])) ? (
                      <img src={p.coverImage || p.images[0]} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 text-4xl">☀️</div>
                    )}
                  </div>
                  <div className="p-4">
                    {p.category && <span className="mb-2 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">{p.category}</span>}
                    <h4 className="font-semibold text-primary text-sm line-clamp-2 group-hover:text-primary-hover transition-colors">{p.title}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                      {s.showLocation !== false && p.location && <span>{p.location}</span>}
                      {s.showYear !== false && p.year && <span>{p.year}</span>}
                      {s.showCapacity !== false && p.capacity && <span>{p.capacity}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {s.buttonLabel && (
          <div className="mt-10 text-center">
            <Link href={String(s.buttonLink || '/proyek')} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-surface transition-colors">
              {String(s.buttonLabel)} <span className="text-lg">→</span>
            </Link>
          </div>
        )}
      </SectionWrapper>
    );
  }

  // Default: Latest Projects
  const max = Math.max(Number(s.maxGridProjects) || 3, 1);
  const display = projects.slice(0, max);
  if (!display.length) return null;
  const featured = display[0];
  const others = display.slice(1);

  return (
    <SectionWrapper section={section}>
      <div className="mb-12 text-center max-w-2xl mx-auto">
        {s.eyebrow ? <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-4">{s.eyebrow as string}</p> : null}
        {s.heading ? <h2 className="text-3xl font-light tracking-tight lg:text-4xl mb-4">{s.heading as string}</h2> : null}
        {s.subheading ? <p className="text-base text-muted leading-relaxed">{s.subheading as string}</p> : null}
      </div>

      {/* Featured Project — large card */}
      <Link href={`/proyek/${featured.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
        <div className="grid md:grid-cols-2">
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-surface">
            {(featured.coverImage || (Array.isArray(featured.images) && featured.images[0])) ? (
              <img src={featured.coverImage || featured.images[0]} alt={featured.title}
                className="h-full w-full object-cover group-hover:scale-105 transition duration-700" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 text-6xl">☀️</div>
            )}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {featured.category && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-700">
                  {featured.category}
                </span>
              )}
              {featured.year && <span className="text-xs text-muted">{featured.year}</span>}
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-primary group-hover:text-primary-hover transition-colors">
              {featured.title}
            </h3>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {s.showLocation !== false && featured.location && (
                <span className="inline-flex items-center gap-1.5">📍 {featured.location}</span>
              )}
              {s.showCapacity !== false && featured.capacity && (
                <span className="inline-flex items-center gap-1.5">⚡ {featured.capacity}</span>
              )}
              {s.showCustomer !== false && featured.customer && (
                <span className="inline-flex items-center gap-1.5">🏢 {featured.customer}</span>
              )}
            </div>
            {featured.shortDescription && (
              <p className="mt-4 text-sm text-muted leading-relaxed line-clamp-3">{featured.shortDescription}</p>
            )}
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              Lihat Detail Proyek <span className="text-lg">→</span>
            </span>
          </div>
        </div>
      </Link>

      {/* Other Projects */}
      {others.length > 0 && (
        <div className="mt-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p: any) => (
              <Link key={p.id} href={`/proyek/${p.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="aspect-[16/10] overflow-hidden bg-surface">
                  {(p.coverImage || (Array.isArray(p.images) && p.images[0])) ? (
                    <img src={p.coverImage || p.images[0]} alt={p.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50 text-4xl">☀️</div>
                  )}
                </div>
                <div className="p-4">
                  {p.category && (
                    <span className="mb-2 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {p.category}
                    </span>
                  )}
                  <h4 className="font-semibold text-primary text-sm line-clamp-2 group-hover:text-primary-hover transition-colors">{p.title}</h4>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                    {s.showLocation !== false && p.location && <span>{p.location}</span>}
                    {s.showYear !== false && p.year && <span>{p.year}</span>}
                    {s.showCapacity !== false && p.capacity && <span>{p.capacity}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View all CTA */}
      <div className="mt-10 text-center">
        <Link href={String(s.buttonLink || '/proyek')}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-surface transition-colors">
          {String(s.buttonLabel || 'Lihat Semua Proyek')} <span className="text-lg">→</span>
        </Link>
      </div>
    </SectionWrapper>
  );
}

import { TestimonialSection } from '@/components/testimonial/TestimonialSection';

function getTestimonialsForSection(
  testimonials: any[],
  settings: Record<string, any> = {},
): any[] {
  const max = typeof settings.maxTestimonials === 'number' && settings.maxTestimonials > 0
    ? settings.maxTestimonials
    : 6;
  const source = String(settings.source || 'latest');

  let pool: any[];

  if (source === 'featured') {
    pool = testimonials.filter((t: any) => t.featured);
  } else if (source === 'manual') {
    const ids: string[] = Array.isArray(settings.testimonialIds)
      ? settings.testimonialIds
      : [];
    pool = testimonials.filter((t: any) => ids.includes(t.id));
  } else {
    // latest: sort by createdAt descending, no featured filter
    pool = [...testimonials].sort(
      (a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
  }

  return pool.slice(0, max);
}

function TestimonialsRenderer({ section, data }: SectionRendererProps) {
  const testimonials = (data as any).testimonials || [];
  const active = getTestimonialsForSection(testimonials, section.settings || {});

  if (active.length === 0) return null;

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title}</p>}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          <TestimonialSection testimonials={active} variant="compact" />
        </div>

        <div className="mt-8 text-center">
          <Link href={String(section.settings.buttonLink || '/testimoni')}
            className="inline-block rounded-full border border-border px-6 py-2.5 text-sm text-muted hover:text-primary hover:border-primary transition">
            {String(section.settings.buttonLabel || 'Lihat Semua Testimoni')}
          </Link>
        </div>
      </div>
    </section>
  );
}


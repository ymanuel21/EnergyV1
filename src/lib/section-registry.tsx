import type { FC } from 'react';

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
  // Context data passed to renderers
  data?: {
    products?: any[];
    brands?: any[];
    banners?: any[];
    projects?: any[];
    productsById?: Record<string, any>;
  };
}

export interface SectionDefinition {
  type: string;
  label: string;
  icon: string;
  defaultSettings: Record<string, unknown>;
  fields: { key: string; label: string }[];
  Renderer: FC<SectionRendererProps>;
}

// Registry — single source of truth for all section types.
// Both Admin Builder and Frontend renderer consume this.
// Adding a new section type = one entry here + one Renderer component.

export const sectionRegistry: Record<string, SectionDefinition> = {
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: '🏠',
    defaultSettings: {
      tagline: 'Energi Terbarukan',
      description: 'Produk berkualitas premium.',
      cta: 'Jelajahi Katalog',
      ctaLink: '/produk',
    },
    fields: [
      { key: 'tagline', label: 'Tagline' },
      { key: 'description', label: 'Description' },
      { key: 'cta', label: 'CTA Button' },
      { key: 'ctaLink', label: 'CTA Link' },
    ],
    Renderer: HeroRenderer,
  },
  'category-grid': {
    type: 'category-grid',
    label: 'Category Grid',
    icon: '📂',
    defaultSettings: {},
    fields: [
      { key: 'heading', label: 'Heading' },
    ],
    Renderer: CategoryGridRenderer,
  },
  'featured-products': {
    type: 'featured-products',
    label: 'Featured Products',
    icon: '⭐',
    defaultSettings: {},
    fields: [
      { key: 'heading', label: 'Section heading' },
    ],
    Renderer: FeaturedProductsRenderer,
  },
  brands: {
    type: 'brands',
    label: 'Brands',
    icon: '🏢',
    defaultSettings: {},
    fields: [
      { key: 'heading', label: 'Section heading' },
    ],
    Renderer: BrandsRenderer,
  },
  cta: {
    type: 'cta',
    label: 'CTA',
    icon: '📣',
    defaultSettings: {
      buttonLabel: 'Konsultasi Gratis',
      buttonLink: '/permintaan-penawaran',
    },
    fields: [
      { key: 'buttonLabel', label: 'Button Label' },
      { key: 'buttonLink', label: 'Button Link' },
    ],
    Renderer: CtaRenderer,
  },
};

export const sectionTypes = Object.values(sectionRegistry);

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
  const featured = productIds.length ? products.filter((p: any) => productIds.includes(p.id)) : [products[0]].filter(Boolean);
  if (!featured.length) return null;
  const p = featured[0];

  return (
    <section className="relative py-16 sm:py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted">{section.title}</p>}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 mt-6">
          <div className="overflow-hidden rounded-3xl bg-card h-96 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5">
            <SafeImage src={p.images?.[0]} alt={p.name} width={600} height={600} className="h-full w-full object-contain p-8" />
          </div>
          <div>
            <h2 className="mt-4 text-3xl font-light tracking-tight">{p.name}</h2>
            <p className="mt-6 text-muted leading-relaxed">{p.description?.substring(0, 180) || 'Produk berkualitas tinggi.'}</p>
            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-3xl font-light">Rp {p.price?.toLocaleString('id-ID')}</span>
              {p.originalPrice > p.price && <span className="text-sm text-muted line-through">Rp {p.originalPrice?.toLocaleString('id-ID')}</span>}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
              <Link href={`/produk/${p.slug}`} className="rounded-full bg-dark-bg px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 shadow-lg text-center transition sm:px-8">Beli Sekarang</Link>
              <Link href={`/produk/${p.slug}`} className="rounded-full px-6 py-3 text-sm font-medium text-muted hover:text-primary text-center transition sm:px-8">Detail →</Link>
            </div>
          </div>
        </div>
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
  return (
    <section className="bg-card py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((p: any) => (
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
                <p className="text-xs text-muted mt-1">{p.location}{p.capacity ? ' · ' + p.capacity : ''}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
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

sectionRegistry['projects'] = {
  type: 'projects', label: 'Projects', icon: '☀️',
  defaultSettings: {},
  fields: [{ key: 'heading', label: 'Section heading' }],
  Renderer: ProjectsRenderer,
};

sectionRegistry['testimonials'] = {
  type: 'testimonials', label: 'Testimonials', icon: '💬',
  defaultSettings: {},
  fields: [{ key: 'heading', label: 'Section heading' }],
  Renderer: TestimonialsRenderer,
};

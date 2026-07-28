import Link from 'next/link';
import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicBanners } from '@/lib/api/banners';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { OrganizationSchema } from '@components/ui/StructuredData';
import { SafeImage } from '@ui/SafeImage';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Energi Cerdas, Tinggal Klik!',
  alternates: { canonical: '/' },
};

const TOP_CATEGORIES = [
  { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial — efisiensi tinggi untuk setiap kebutuhan', s:'panel-surya' },
  { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro — konversi daya yang andal', s:'inverter' },
  { n:'Baterai', d:'Lithium LiFePO4, Rack Mounted, Wall, All-in-One ESS', s:'baterai' },
  { n:'Paket PLTS', d:'Solusi lengkap untuk rumah, kantor, dan industri', s:'paket-plts' },
];

export default async function HomePage() {
  const [products, brands, banners, sections] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicBanners().catch(() => []),
    getPublicHomepageSections(),
  ]);

  // Dynamic renderer — loop sections, render matching component
  return (
    <>
      <OrganizationSchema />
      {sections.map((section: any) => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} section={section} banner={banners.find((b: any) => b.image && !b.image.includes('placeholder'))} />;
          case 'category-grid':
            return <CategoryGridSection key={section.id} section={section} />;
          case 'featured-products':
            return <FeaturedProductsSection key={section.id} section={section} products={products} />;
          case 'brands':
            return <BrandsSection key={section.id} section={section} brands={brands} />;
          case 'cta':
            return <CtaSection key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </>
  );
}

/* ===== SECTION RENDERERS ===== */

function HeroSection({ section, banner }: { section: any; banner?: any }) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF5 40%, #F5F5F0 100%)' }}>
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-50/50 blur-3xl" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-16 px-8 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[.25em] text-muted">Energi Terbarukan</p>
          <h1 className="mt-6 text-4xl font-light leading-tight tracking-tight text-primary lg:text-6xl">
            {section.title || 'Tenaga surya'}<br />
            <span className="font-semibold">{section.subtitle || 'untuk semua.'}</span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed text-muted max-w-md">
            Produk berkualitas premium, dikurasi dengan cermat. Dari panel hingga sistem lengkap.
          </p>
          <div className="mt-10 flex gap-3">
            <Link href="/produk" className="rounded-full bg-dark-bg px-8 py-3.5 text-sm font-medium text-white hover:bg-gray-800 shadow-lg transition">Jelajahi Katalog</Link>
            <Link href="/permintaan-penawaran" className="rounded-full px-8 py-3.5 text-sm font-medium text-muted hover:text-primary transition">Minta Penawaran →</Link>
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

function CategoryGridSection({ section }: { section: any }) {
  return (
    <section className="relative bg-card py-32">
      <div className="mx-auto max-w-5xl px-8">
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

function FeaturedProductsSection({ section, products }: { section: any; products: any[] }) {
  const productIds: string[] = section.settings?.productIds || [];
  const featured = productIds.length ? products.filter(p => productIds.includes(p.id)) : [products[0]].filter(Boolean);
  if (!featured.length) return null;

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-8">
        {section.title && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted">{section.title}</p>}
        {featured.map((p: any) => (
          <div key={p.id} className="grid items-center gap-16 lg:grid-cols-2 mt-6">
            <div className="overflow-hidden rounded-3xl bg-card h-96 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5">
              <SafeImage src={p.images?.[0]} alt={p.name} width={600} height={600} className="h-full w-full object-contain p-8" />
            </div>
            <div>
              {section.subtitle && <p className="text-xs font-medium uppercase tracking-[.25em] text-muted">{section.subtitle}</p>}
              <h2 className="mt-4 text-3xl font-light tracking-tight">{p.name}</h2>
              <p className="mt-6 text-muted leading-relaxed">{p.description?.substring(0, 180) || 'Produk berkualitas tinggi.'}</p>
              <div className="mt-8 flex items-baseline gap-4">
                <span className="text-3xl font-light">Rp {p.price?.toLocaleString('id-ID')}</span>
                {p.originalPrice > p.price && <span className="text-sm text-muted line-through">Rp {p.originalPrice?.toLocaleString('id-ID')}</span>}
              </div>
              <div className="mt-8 flex gap-3">
                <Link href={`/produk/${p.slug}`} className="rounded-full bg-dark-bg px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 shadow-lg transition">Beli Sekarang</Link>
                <Link href={`/produk/${p.slug}`} className="rounded-full px-8 py-3 text-sm font-medium text-muted hover:text-primary transition">Detail →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandsSection({ section, brands }: { section: any; brands: any[] }) {
  return (
    <section className="bg-card py-24">
      <div className="mx-auto max-w-5xl px-8">
        <p className="text-xs font-medium uppercase tracking-[.25em] text-muted mb-8 text-center">{section.title || 'Brand Resmi'}</p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-30">
          {brands.slice(0, 8).map((b: any) => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="text-sm font-bold tracking-wider text-muted hover:opacity-70 transition">
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ section }: { section: any }) {
  return (
    <section className="relative overflow-hidden bg-dark-bg">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-2xl px-8 py-32 text-center">
        <h2 className="text-3xl font-light tracking-tight text-white lg:text-4xl">{section.title || 'Butuh bantuan?'}</h2>
        {section.subtitle && <p className="mt-6 text-lg text-muted">{section.subtitle}</p>}
        <Link href={section.settings?.buttonLink || '/permintaan-penawaran'} className="mt-8 inline-block rounded-full bg-card px-10 py-4 text-sm font-medium text-primary hover:bg-gray-100 shadow-lg transition">
          {section.settings?.buttonLabel || 'Konsultasi Gratis'}
        </Link>
      </div>
    </section>
  );
}

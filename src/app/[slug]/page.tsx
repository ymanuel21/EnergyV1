import { notFound } from 'next/navigation';
import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicBanners } from '@/lib/api/banners';
import { getPublicHomepageSections, getLandingPages } from '@/lib/api/homepage-sections';
import { sectionRegistry } from '@/lib/section-registry';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Reserved slugs that are actual app routes
const RESERVED = ['produk', 'kategori', 'brand', 'perbandingan', 'wishlist', 'keranjang',
  'checkout', 'cari', 'artikel', 'faq', 'promo', 'permintaan-penawaran',
  'barang-clearance', 'produk-baru', 'halaman', 'admin', 'api', '_next'];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.includes(slug)) return {};
  const pages = await getLandingPages();
  const page = pages.find(p => p.slug === slug);
  if (!page) return {};
  return { title: page.title, description: page.description };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.includes(slug)) notFound();

  const pages = await getLandingPages();
  const page = pages.find(p => p.slug === slug);
  if (!page) notFound();

  const [products, brands, banners, sections] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicBanners().catch(() => []),
    getPublicHomepageSections(page.id),
  ]);

  const contextData = { products, brands, banners };

  return (
    <>
      {sections.map((section: any) => {
        const def = sectionRegistry[section.type as string];
        if (!def) return null;
        const { Renderer } = def;
        return <Renderer key={section.id} section={section} data={contextData} />;
      })}
    </>
  );
}

import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicBanners } from '@/lib/api/banners';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { OrganizationSchema } from '@components/ui/StructuredData';
import { sectionRegistry } from '@/lib/section-registry';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Energi Cerdas, Tinggal Klik!',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [products, brands, banners, sections] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicBanners().catch(() => []),
    getPublicHomepageSections(),
  ]);

  const contextData = { products, brands, banners: banners.filter((b: any) => b.image && !b.image.includes('placeholder')) };

  return (
    <>
      <OrganizationSchema />
      {sections.map((section: any) => {
        const def = sectionRegistry[section.type as string];
        if (!def) return null;
        const { Renderer } = def;
        return <Renderer key={section.id} section={section} data={contextData} />;
      })}
    </>
  );
}

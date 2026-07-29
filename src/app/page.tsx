import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicBanners } from '@/lib/api/banners';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { projectRepo } from '@/lib/repositories/project';
import { OrganizationSchema } from '@components/ui/StructuredData';
import { sectionRegistry } from '@/lib/section-registry';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Energi Cerdas, Tinggal Klik!',
  alternates: { canonical: '/' },
};

export default async function HomePage(props: { searchParams?: Promise<{ preview?: string }> }) {
  const sp = await (props.searchParams || Promise.resolve({} as { preview?: string }));
  const preview = sp.preview === 'true';
  const [products, brands, banners, sections, projects] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicBanners().catch(() => []),
    getPublicHomepageSections(undefined, preview),
    projectRepo.findPublic(),
  ]);

  const contextData = { products, brands, banners: banners.filter((b: any) => b.image && !b.image.includes('placeholder')), projects };

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

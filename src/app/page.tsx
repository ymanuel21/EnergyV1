import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { projectRepo } from '@/lib/repositories/project';
import { testimonialRepo } from '@/lib/repositories/index';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
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
  const [products, brands, sections, projects, testimonials] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicHomepageSections(undefined, preview),
    projectRepo.findPublic(),
    testimonialRepo.findPublic(),
  ]);

  const priceLabels = await resolvePriceLabels(products as any[]);
  const contextData = { products, priceLabels, brands, projects, testimonials };

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

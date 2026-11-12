import { getTranslations } from 'next-intl/server';
import { getAllProducts } from '@/lib/api/products';import { getAllBrands } from '@/lib/api/brands';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { getProductsForSections } from '@/lib/api/products';
import { projectRepo } from '@/lib/repositories/project';
import { testimonialRepo } from '@/lib/repositories/index';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { OrganizationSchema } from '@components/ui/StructuredData';
import { sectionRegistry } from '@/lib/section-registry';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return {
    // `absolute` keeps the brand search term in the title and bypasses the layout template.
    title: { absolute: tr('meta.page.tsx.title') },
    description: tr('common.siteDescription'),  alternates: { canonical: '/' },
  };
}

export default async function HomePage(props: { searchParams?: Promise<{ preview?: string }> }) {
  const tr = await getTranslations();
  const sp = await (props.searchParams || Promise.resolve({} as { preview?: string }));
  const preview = sp.preview === 'true';

  // `dynamic = 'force-dynamic'` is KEPT: this route reads `?preview=true` and is
  // wrapped in the request-scoped SiteProvider. Only the product read is reduced —
  // the section renderers resolve products by id/slug or take the first
  // `maxProducts` of the catalogue order, so fetching the head of that order plus
  // the referenced rows returns the same objects the renderers previously found
  // inside the full catalogue (verified: only HeroRenderer and
  // FeaturedProductsRenderer read data.products).
  const sections = await getPublicHomepageSections(undefined, preview);
  const [products, brands, projects, testimonials] = await Promise.all([
    getProductsForSections(sections as any[]),
    getAllBrands(),
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

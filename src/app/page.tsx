import { getAllProducts } from '@/lib/api/products';
import { getAllBrands } from '@/lib/api/brands';
import { getPublicBanners } from '@/lib/api/banners';
import { getPublicHomepageSections } from '@/lib/api/homepage-sections';
import { projectRepo } from '@/lib/repositories/project';
import { testimonialRepo } from '@/lib/repositories/index';
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
  const [products, brands, banners, sections, projects, testimonials] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getPublicBanners().catch(() => []),
    getPublicHomepageSections(undefined, preview),
    projectRepo.findPublic(),
    testimonialRepo.findPublic(),
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

      {/* Featured Testimonials */}
      {testimonials.filter((t: any) => t.featured).length > 0 && (
        <section className="py-16 bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary text-center mb-10">Apa Kata Pelanggan</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.filter((t: any) => t.featured).slice(0, 6).map((t: any) => (
                <div key={t.id} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm">👤</div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-primary">{t.name}</p>
                      <p className="text-xs text-muted">{t.company}{t.company && t.role ? ' · ' : ''}{t.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-2">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                  <p className="text-sm text-muted italic">&ldquo;{t.quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { projectRepo } from '@/lib/repositories/project';
import { getPrisma } from '@/lib/db';
import { ProductAccordion } from './ProductAccordion';
import { SmartBackButton } from '@/components/ui/SmartBackButton';
import { PhotoGallery } from '@/components/project/PhotoGallery';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await projectRepo.findBySlug(slug);
  if (!project) return { title: 'Proyek — EBTPlaza' };
  return { title: `${(project as any).title} — Proyek — EBTPlaza` };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await projectRepo.findBySlug(slug) as any;
  if (!project) notFound();

  // Resolve linked product names from productIds slugs
  const prisma = await getPrisma();
  const rawIds: any[] = Array.isArray(project.productIds) ? project.productIds : [];
  // Support both old format (string[]) and new format ({slug, quantity}[])
  const slugs: string[] = rawIds.map((p: any) => typeof p === 'string' ? p : p.slug || p.productId || '');
  const quantities: Record<string, number> = {};
  rawIds.forEach((p: any) => {
    if (typeof p === 'string') { quantities[p] = 1; }
    else { quantities[p.slug || p.productId || ''] = p.quantity || 1; }
  });
  let linkedProducts: { slug: string; name: string; quantity: number }[] = [];
  if (slugs.length > 0) {
    const products = await prisma.product.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, name: true },
    });
    const nameMap = new Map(products.map((p: any) => [p.slug, p.name]));

    linkedProducts = slugs.map(ref => {
      const qty = quantities[ref] || 1;
      const name = nameMap.get(ref);
      if (name) return { slug: ref, name, quantity: qty };
      return { slug: '', name: 'Produk tidak tersedia', quantity: qty };
    });
  }

  const images: string[] = Array.isArray(project.images) ? project.images : [];
  const highlights: string[] = Array.isArray(project.highlights) ? project.highlights : [];
  const allImages = project.coverImage ? [project.coverImage, ...images] : images;

  return (
    <Container className="py-6">
      <SmartBackButton fallbackRoute="/proyek" label="← Kembali ke Proyek" className="mb-3" />
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Proyek', href: '/proyek' }, { label: project.title }]} />

      {/* Hero */}
      {allImages[0] && (
        <div className="mt-4 aspect-[2/1] w-full overflow-hidden rounded-2xl bg-surface">
          <img src={allImages[0]} alt={project.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Gallery — Lightbox */}
      <PhotoGallery images={allImages.slice(1)} title={project.title} />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-primary">{project.title}</h1>
          <p className="mt-2 text-muted">{project.location} · {project.year}</p>

          {project.richDescription && (
            <div className="mt-6 text-sm leading-relaxed text-primary space-y-4" dangerouslySetInnerHTML={{ __html: project.richDescription }} />
          )}
          {!project.richDescription && project.description && (
            <p className="mt-6 text-sm leading-relaxed text-muted">{project.description}</p>
          )}

          {/* Story */}
          {(project.storyData as any)?.challenge || (project.storyData as any)?.solution || (project.storyData as any)?.result ? (
            <div className="mt-8 space-y-6">
              {(project.storyData as any)?.challenge && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-amber-600 mb-2">Tantangan</h3>
                  <p className="text-sm text-muted leading-relaxed">{(project.storyData as any).challenge}</p>
                </div>
              )}
              {(project.storyData as any)?.solution && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-blue-600 mb-2">Solusi</h3>
                  <p className="text-sm text-muted leading-relaxed">{(project.storyData as any).solution}</p>
                </div>
              )}
              {(project.storyData as any)?.result && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-green-600 mb-2">Hasil</h3>
                  <p className="text-sm text-muted leading-relaxed">{(project.storyData as any).result}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img: string, i: number) => (
                <img key={i} src={img} alt={`${project.title} - ${i + 1}`} className="aspect-square rounded-xl object-cover bg-surface" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-primary">Project Info</h3>
            {project.customer && <div><p className="text-xs text-muted">Customer</p><p className="text-sm font-medium text-primary">{project.customer}</p></div>}
            {project.industry && <div><p className="text-xs text-muted">Industry</p><p className="text-sm font-medium text-primary">{project.industry}</p></div>}
            {project.category && <div><p className="text-xs text-muted">Category</p><p className="text-sm font-medium text-primary capitalize">{project.category}</p></div>}
            {project.capacity && <div><p className="text-xs text-muted">Capacity</p><p className="text-sm font-medium text-primary">{project.capacity}</p></div>}
          </div>

          {project.systemType || project.pvModule || project.inverter || project.battery ? (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary">Technical Specs</h3>
              {project.systemType && <div><p className="text-xs text-muted">System Type</p><p className="text-sm font-medium text-primary">{project.systemType}</p></div>}
              {project.pvModule && <div><p className="text-xs text-muted">PV Module</p><p className="text-sm font-medium text-primary">{project.pvModule}</p></div>}
              {project.inverter && <div><p className="text-xs text-muted">Inverter</p><p className="text-sm font-medium text-primary">{project.inverter}</p></div>}
              {project.battery && <div><p className="text-xs text-muted">Battery</p><p className="text-sm font-medium text-primary">{project.battery}</p></div>}
            </div>
          ) : null}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-2">
              <h3 className="text-sm font-semibold text-primary">Highlights</h3>
              <ul className="space-y-1.5">
                {highlights.map((h: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-muted">
                    <span className="text-primary shrink-0">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact Metrics */}
          {(project.impactData as any)?.co2Reduction || (project.impactData as any)?.annualSavings || (project.impactData as any)?.energyGenerated ? (
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary">Dampak</h3>
              {(project.impactData as any)?.co2Reduction && (
                <div className="flex items-center gap-2"><span className="text-lg">🌱</span><div><p className="text-xs text-muted">CO₂ Reduction</p><p className="text-sm font-medium text-primary">{(project.impactData as any).co2Reduction}</p></div></div>
              )}
              {(project.impactData as any)?.annualSavings && (
                <div className="flex items-center gap-2"><span className="text-lg">💰</span><div><p className="text-xs text-muted">Annual Savings</p><p className="text-sm font-medium text-primary">{(project.impactData as any).annualSavings}</p></div></div>
              )}
              {(project.impactData as any)?.energyGenerated && (
                <div className="flex items-center gap-2"><span className="text-lg">⚡</span><div><p className="text-xs text-muted">Energy Generated</p><p className="text-sm font-medium text-primary">{(project.impactData as any).energyGenerated}</p></div></div>
              )}
            </div>
          ) : null}

          {/* Linked Products Accordion */}
          <ProductAccordion products={linkedProducts} />

          <Link href={`/permintaan-penawaran?project=${project.slug}`} className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-hover transition">
            Minta Penawaran Serupa
          </Link>
        </div>
      </div>
    </Container>
  );
}

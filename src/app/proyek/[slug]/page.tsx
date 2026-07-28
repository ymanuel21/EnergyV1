import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { projectRepo } from '@/lib/repositories/project';

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

  const images: string[] = Array.isArray(project.images) ? project.images : [];
  const highlights: string[] = Array.isArray(project.highlights) ? project.highlights : [];
  const allImages = project.coverImage ? [project.coverImage, ...images] : images;

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Proyek', href: '/proyek' }, { label: project.title }]} />

      {/* Hero */}
      {allImages[0] && (
        <div className="mt-4 aspect-[2/1] w-full overflow-hidden rounded-2xl bg-surface">
          <img src={allImages[0]} alt={project.title} className="h-full w-full object-cover" />
        </div>
      )}

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

          <Link href="/permintaan-penawaran" className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-hover transition">
            Minta Penawaran Serupa
          </Link>
        </div>
      </div>
    </Container>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { projectRepo } from '@/lib/repositories/project';
import TrackPage from '@/components/ui/TrackPage';

export const metadata: Metadata = { title: 'Proyek — EBTPlaza', description: 'Portofolio instalasi energi surya.' };

const CATEGORY_LABELS: Record<string, string> = {
  residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial',
  government: 'Government', school: 'School',
};

export default async function ProjectsPage() {
  const projects = await projectRepo.findPublic();

  return (
    <>
      <TrackPage scope="projects" />
      <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Proyek' }]} />
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-primary">Proyek Referensi</h1>
        <p className="mt-1 text-sm text-muted">{projects.length} proyek</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p: any) => (
          <Link key={p.id} href={`/proyek/${p.slug}`}
            className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition">
            {(p.coverImage || (Array.isArray(p.images) && p.images[0])) ? (
              <div className="aspect-[4/3] overflow-hidden bg-surface">
                <img src={p.coverImage || (Array.isArray(p.images) && p.images[0])} alt={p.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center bg-surface text-3xl text-muted">☀️</div>
            )}
            <div className="p-5">
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-primary capitalize">{CATEGORY_LABELS[p.category] || p.category}</span>
                {p.capacity && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{p.capacity}</span>}
              </div>
              <h3 className="mt-2 font-semibold text-primary group-hover:text-primary-hover transition line-clamp-2">{p.title}</h3>
              <p className="mt-1 text-xs text-muted">{p.location}{p.location && p.year ? ' · ' : ''}{p.year}</p>
              {p.shortDescription && <p className="mt-2 text-xs text-muted line-clamp-2">{p.shortDescription}</p>}
            </div>
          </Link>
        ))}
      </div>
      {projects.length === 0 && <p className="text-center py-16 text-muted">Belum ada proyek.</p>}
    </Container>
    </>
  );
}

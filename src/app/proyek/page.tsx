import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getPrisma } from '@/lib/db';

export const metadata: Metadata = { title: 'Projects — EBTPlaza', description: 'Portofolio instalasi tenaga surya.' };

export default async function ProjectsPage() {
  const prisma = await getPrisma();
  const projects = await prisma.project.findMany({ where: { published: true }, orderBy: { year: 'desc' } });

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Projects' }]} />
      <h1 className="mt-4 text-2xl font-bold text-primary">Our Projects</h1>
      <p className="mt-1 text-sm text-muted">{projects.length} installations</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p: any) => (
          <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-surface flex items-center justify-center text-4xl">☀️</div>
            <div className="p-4">
              <span className="text-xs text-muted capitalize">{p.category} · {p.capacity}</span>
              <h2 className="mt-1 text-lg font-semibold text-primary">{p.title}</h2>
              <p className="mt-1 text-xs text-muted">{p.location} · {p.year} · {p.customer}</p>
              {p.description && <p className="mt-2 text-sm text-muted line-clamp-2">{p.description}</p>}
            </div>
          </div>
        ))}
      </div>
      {projects.length === 0 && <p className="text-muted text-center py-12">Coming soon.</p>}
    </Container>
  );
}

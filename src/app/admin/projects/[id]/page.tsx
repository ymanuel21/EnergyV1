export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { getAdminPrisma } from '../../lib/admin-prisma';
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProjectEditForm } from '../ProjectEditForm';
import { getLatestReview } from '@/lib/services/review';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getAdminPrisma();
  const [project, review] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    getLatestReview('project', id),
  ]);
  if (!project) notFound();

  // Merge draftData — draft values override live fields for form defaults
  const draft = (project.draftData as Record<string, any>) || {};
  const hasDraft = project.status === 'draft' && Object.keys(draft).length > 0;
  const merged = hasDraft
    ? { ...project, ...draft, images: Array.isArray(draft.images) ? draft.images : (project.images as string[]) }
    : { ...project, images: (project.images as string[]) || [] };

  async function handleDelete() {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.review.deleteMany({ where: { entityType: 'project', entityId: id } });
    await prisma.project.delete({ where: { id } });
    redirect('/admin/projects');
  }

  const status = project.status as 'draft' | 'published' | 'archived';
  const reviewStatus = review?.status as string | null;
  const reviewNotes = review?.notes as string | null;

  const headerStatus = (
    reviewStatus === 'pending' ? 'review_pending' as const :
    reviewStatus === 'approved' ? 'review_approved' as const :
    reviewStatus === 'rejected' ? 'review_rejected' as const :
    status
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects" className="text-muted hover:text-primary text-sm">← Back</Link>
          <h1 className="text-xl font-bold text-primary">{merged.title || 'Edit Project'}</h1>
          <StatusBadge status={headerStatus} />
        </div>
        <form action={handleDelete}>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
        </form>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card">
        <ProjectEditForm
          project={{
            id: project.id,
            title: (merged.title as string) || '',
            slug: (merged.slug as string) || '',
            shortDescription: (merged.shortDescription as string) || '',
            richDescription: (merged.richDescription as string) || '',
            category: (merged.category as string) || 'residential',
            industry: (merged.industry as string) || '',
            systemType: (merged.systemType as string) || '',
            capacity: (merged.capacity as string) || '',
            pvModule: (merged.pvModule as string) || '',
            inverter: (merged.inverter as string) || '',
            battery: (merged.battery as string) || '',
            location: (merged.location as string) || '',
            customer: (merged.customer as string) || '',
            year: (merged.year as number) || 2025,
            coverImage: (merged.coverImage as string) || '',
            images: (merged.images as string[]) || [],
            highlights: (merged.highlights as string[]) || [],
            productIds: (merged.productIds as string[]) || [],
            storyData: (merged.storyData as any) || {},
            impactData: (merged.impactData as any) || {},
            seoData: (merged.seoData as any) || {},
            featured: (merged.featured as boolean) || false,
            status: project.status,
            updatedAt: project.updatedAt.toISOString(),
          }}
          reviewStatus={reviewStatus}
          reviewNotes={reviewNotes}
        />
      </div>
    </div>
  );
}

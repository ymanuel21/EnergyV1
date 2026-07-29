export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { getAdminPrisma } from '../../lib/admin-prisma';
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { TestimonialEditForm } from '../TestimonialEditForm';
import { getLatestReview } from '@/lib/services/review';

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getAdminPrisma();
  const [testimonial, review] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id } }),
    getLatestReview('testimonial', id),
  ]);
  if (!testimonial) notFound();

  const draft = (testimonial.draftData as Record<string, any>) || {};
  const hasDraft = testimonial.status === 'draft' && Object.keys(draft).length > 0;
  const merged = hasDraft
    ? { ...testimonial, ...draft }
    : testimonial;

  const status = testimonial.status as 'draft' | 'published' | 'archived';
  const reviewStatus = review?.status as string | null;

  const headerStatus = (
    reviewStatus === 'pending' ? 'review_pending' as const :
    reviewStatus === 'approved' ? 'review_approved' as const :
    reviewStatus === 'rejected' ? 'review_rejected' as const :
    status
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/testimonials" className="text-muted hover:text-primary text-sm">← Back</Link>
          <h1 className="text-xl font-bold text-primary">Edit Testimonial</h1>
          <StatusBadge status={headerStatus} />
        </div>
        <form action={async () => { 'use server'; const p = await getAdminPrisma(); await p.review.deleteMany({ where: { entityType: 'testimonial', entityId: id } }); await p.testimonial.delete({ where: { id } }); redirect('/admin/testimonials'); }}>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <TestimonialEditForm
          testimonial={{
            id: testimonial.id,
            name: (merged.name as string) || '',
            company: (merged.company as string) || '',
            role: (merged.role as string) || '',
            quote: (merged.quote as string) || '',
            rating: (merged.rating as number) || 5,
            photo: (merged.photo as string) || '',
            productIds: (merged.productIds as string[]) || [],
            featured: (merged.featured as boolean) || false,
            sortOrder: (merged.sortOrder as number) || 0,
            status: testimonial.status,
            updatedAt: testimonial.updatedAt.toISOString(),
          }}
          reviewStatus={reviewStatus}
          reviewNotes={review?.notes || null}
        />
      </div>
    </div>
  );
}

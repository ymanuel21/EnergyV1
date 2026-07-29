export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../../lib/admin-prisma';
import { redirect } from 'next/navigation';

export default async function NewTestimonialPage() {
  async function handleCreate(data: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: (data.get('name') as string) || 'New Testimonial',
        quote: (data.get('quote') as string) || '',
        status: 'draft',
        draftData: {},
        rating: 5,
      },
    });
    redirect(`/admin/testimonials/${testimonial.id}`);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-6">New Testimonial</h1>
      <form action={handleCreate} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Customer Name</label>
          <input name="name" required className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="e.g. Budi Santoso" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Quote</label>
          <textarea name="quote" rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="What did they say?" />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
          Create & Edit
        </button>
      </form>
    </div>
  );
}

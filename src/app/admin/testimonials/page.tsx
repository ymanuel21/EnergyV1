export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export default async function TestimonialsPage() {
  const prisma = await getAdminPrisma();
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });

  async function handleCreate(data: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.testimonial.create({
      data: {
        name: data.get('name') as string,
        company: data.get('company') as string,
        role: data.get('role') as string,
        quote: data.get('quote') as string,
        rating: parseInt(data.get('rating') as string) || 5,
      },
    });
    revalidatePath('/admin/testimonials');
  }

  async function handleToggle(id: string, published: boolean) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.testimonial.update({ where: { id }, data: { published } });
    revalidatePath('/admin/testimonials');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Testimonials</h1>
      <p className="text-sm text-muted mb-6">{testimonials.length} testimonials</p>

      {testimonials.map((t: any) => (
        <div key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 mb-2">
          <span className="text-2xl">{'⭐'.repeat(t.rating)}</span>
          <div className="flex-1">
            <p className="text-sm text-primary italic">&ldquo;{t.quote}&rdquo;</p>
            <p className="text-xs text-muted mt-1">{t.name} · {t.company} · {t.role}</p>
          </div>
          {t.published ? <span className="text-[10px] text-green-600">Live</span> : <span className="text-[10px] text-amber-600">Draft</span>}
          <form action={handleToggle.bind(null, t.id, !t.published)} className="inline">
            <button type="submit" className="rounded border border-border px-2 py-1 text-[10px] text-muted">{t.published ? 'Hide' : 'Show'}</button>
          </form>
        </div>
      ))}

      <div className="mt-6 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Add Testimonial</h2>
        <form action={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Name" required className="rounded border border-border px-3 py-2 text-sm" />
          <input name="company" placeholder="Company" className="rounded border border-border px-3 py-2 text-sm" />
          <input name="role" placeholder="Role" className="rounded border border-border px-3 py-2 text-sm" />
          <select name="rating" defaultValue="5" className="rounded border border-border px-3 py-2 text-sm">
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)}</option>)}
          </select>
          <div className="sm:col-span-2">
            <textarea name="quote" placeholder="Testimonial quote" required rows={3} className="w-full rounded border border-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover sm:col-span-2">Add Testimonial</button>
        </form>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';
import Link from 'next/link';

export default async function TestimonialsPage() {
  const prisma = await getAdminPrisma();
  const testimonials = await prisma.testimonial.findMany();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Testimonials</h1>
        <Link href="/admin/testimonials/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
          + New Testimonial
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium text-primary">Customer</th>
              <th className="p-4 text-left font-medium text-primary hidden md:table-cell">Company</th>
              <th className="p-4 text-left font-medium text-primary">Rating</th>
              <th className="p-4 text-right font-medium text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t: any) => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-surface/50 transition">
                <td className="p-4 font-medium text-primary">{t.name}</td>
                <td className="p-4 hidden md:table-cell text-muted">{t.company || '—'}</td>
                <td className="p-4">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/testimonials/${t.id}`} className="text-sm text-primary hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted">No testimonials yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

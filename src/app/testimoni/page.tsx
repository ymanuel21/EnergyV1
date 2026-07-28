import { getPrisma } from '@/lib/db';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Testimonials — EBTPlaza', description: 'Apa kata pelanggan kami.' };

export default async function TestimonialsPage() {
  const prisma = await getPrisma();
  const testimonials = await prisma.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Testimonials' }]} />
      <h1 className="mt-4 text-2xl font-bold text-primary">Testimonials</h1>
      <p className="mt-1 text-sm text-muted">{testimonials.length} reviews</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {testimonials.map((t: any) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-6">
            <div className="flex mb-3">{'⭐'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            <p className="text-sm text-muted italic">&ldquo;{t.quote}&rdquo;</p>
            <p className="text-xs text-primary mt-3 font-medium">{t.name}</p>
            {(t.company || t.role) && <p className="text-xs text-muted">{t.company}{t.company && t.role ? ' · ' : ''}{t.role}</p>}
          </div>
        ))}
      </div>
      {testimonials.length === 0 && <p className="text-muted text-center py-12">Coming soon.</p>}
    </Container>
  );
}

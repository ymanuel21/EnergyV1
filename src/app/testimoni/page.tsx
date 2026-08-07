import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { TestimonialGrid } from './TestimonialGrid';

export const metadata: Metadata = { title: 'Testimoni — EBTPlaza', description: 'Apa kata pelanggan kami.' };

async function getPublicTestimonials() {
  const { getPrisma } = await import('@/lib/db');
  const prisma = await getPrisma();
  return prisma.testimonial.findMany({
    where: { status: 'published' },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function TestimonialsPage() {
  const testimonials = await getPublicTestimonials();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Testimoni' }]} />
      <h1 className="mt-4 text-2xl font-bold text-primary">Testimoni Pelanggan</h1>
      <p className="mt-1 text-sm text-muted">{testimonials.length} ulasan</p>
      <div className="mt-6">
        <TestimonialGrid testimonials={testimonials as any} />
      </div>
    </Container>
  );
}

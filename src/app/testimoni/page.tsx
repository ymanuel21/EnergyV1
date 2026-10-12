import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { TestimonialGrid } from './TestimonialGrid';

export const metadata: Metadata = { title: 'Testimonials — EBTPlaza', description: 'What our customers say.' };

async function getPublicTestimonials() {
  const { getPrisma } = await import('@/lib/db');
  const { applyEnList } = await import('@/lib/i18n/apply-en');
  const prisma = await getPrisma();
  const rows = await prisma.testimonial.findMany({
    where: { status: 'published' },
    orderBy: { sortOrder: 'asc' },
  });
  return applyEnList('testimonials', rows);
}

export default async function TestimonialsPage() {
  const testimonials = await getPublicTestimonials();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]} />
      <h1 className="mt-4 text-2xl font-bold text-primary">Customer Testimonials</h1>
      <p className="mt-1 text-sm text-muted">{testimonials.length} ulasan</p>
      <div className="mt-6">
        <TestimonialGrid testimonials={testimonials as any} />
      </div>
    </Container>
  );
}

import { getTranslations } from 'next-intl/server';
import { localizeRows } from '@/lib/i18n/server';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { TestimonialGrid } from './TestimonialGrid';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return { title: tr('meta.testimoni.title'), description: tr('meta.testimoni.description')   };
}

async function getPublicTestimonials() {
  try {
    const { getPrisma } = await import('@/lib/db');
    const prisma = await getPrisma();
    // `await` (not `return`) so a driver-adapter failure is caught here.
    const rows = await prisma.testimonial.findMany({
      where: { status: 'published' },
      orderBy: { sortOrder: 'asc' },
    });
    return localizeRows('testimonials', rows);
  } catch (e) {
    console.error('[public-read] getPublicTestimonials failed:', (e as Error).message);    return [];
  }
}

export default async function TestimonialsPage() {
  const tr = await getTranslations();
  const testimonials = await getPublicTestimonials();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Testimonials' }]} />
      <h1 className="mt-4 text-2xl font-bold text-primary">{tr('testimonial.customerTestimonials')}</h1>
      <p className="mt-1 text-sm text-muted">{testimonials.length} ulasan</p>
      <div className="mt-6">
        <TestimonialGrid testimonials={testimonials as any} />
      </div>
    </Container>
  );
}

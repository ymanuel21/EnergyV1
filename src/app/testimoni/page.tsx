import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getPrisma } from '@/lib/db';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Testimoni — EBTPlaza', description: 'Apa kata pelanggan kami.' };

async function getPublicTestimonials() {
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
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {testimonials.map((t: any) => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              {t.photo ? (
                <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-lg">👤</div>
              )}
              <div>
                <p className="text-sm font-medium text-primary">{t.name}</p>
                {(t.company || t.role) && (
                  <p className="text-xs text-muted">{t.company}{t.company && t.role ? ' · ' : ''}{t.role}</p>
                )}
              </div>
            </div>
            <div className="flex mb-3">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
            <p className="text-sm text-muted italic">&ldquo;{t.quote}&rdquo;</p>
            {Array.isArray(t.productIds) && (t.productIds as string[]).length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <Link href={`/proyek/${(t.productIds as string[])[0]}`}
                  className="text-xs text-primary hover:underline">
                  Lihat Proyek Terkait →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      {testimonials.length === 0 && (
        <p className="text-muted text-center py-12">Belum ada testimoni.</p>
      )}
    </Container>
  );
}

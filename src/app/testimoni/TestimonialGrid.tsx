'use client';

import { TestimonialSection, TestimonialData } from '@/components/testimonial/TestimonialSection';

export function TestimonialGrid({ testimonials }: { testimonials: TestimonialData[] }) {
  if (!testimonials || testimonials.length === 0) {
    return <p className="text-muted text-center py-12">Belum ada testimoni.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <TestimonialSection testimonials={testimonials}>
        {(t) => (
          <div className="rounded-xl border border-border bg-card p-6 h-full">
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
            <div className="flex mb-3 text-amber-400">
              {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
            </div>
            <p className="text-sm text-muted italic line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
            {Array.isArray(t.productIds) && (t.productIds as string[]).length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-xs text-primary">Lihat Proyek Terkait →</span>
              </div>
            )}
          </div>
        )}
      </TestimonialSection>
    </div>
  );
}

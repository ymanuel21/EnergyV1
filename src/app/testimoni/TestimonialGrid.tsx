'use client';

import { TestimonialSection, TestimonialData } from '@/components/testimonial/TestimonialSection';

export function TestimonialGrid({ testimonials }: { testimonials: TestimonialData[] }) {
  if (!testimonials || testimonials.length === 0) {
    return <p className="text-muted text-center py-12">No testimonials yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <TestimonialSection testimonials={testimonials} />
    </div>
  );
}

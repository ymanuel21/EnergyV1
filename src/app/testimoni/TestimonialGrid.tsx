'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Testimonial {
  id: string;
  name: string;
  company?: string;
  role?: string;
  quote: string;
  rating: number;
  photo?: string;
  productIds?: string[];
  createdAt?: string;
}

function TestimonialModal({ testimonial, onClose }: { testimonial: Testimonial; onClose: () => void }) {
  // ESC key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Photo + Name */}
          <div className="flex items-center gap-4 mb-4">
            {testimonial.photo ? (
              <img src={testimonial.photo} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{testimonial.name}</h2>
              {(testimonial.company || testimonial.role) && (
                <p className="text-sm text-gray-500">
                  {testimonial.role}{testimonial.role && testimonial.company ? ' · ' : ''}{testimonial.company}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex mb-4 text-xl">
            {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
          </div>

          {/* Quote */}
          <blockquote className="text-gray-700 leading-relaxed text-sm sm:text-base">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>

          {/* Date */}
          {testimonial.createdAt && (
            <p className="mt-3 text-xs text-gray-400">
              {new Date(testimonial.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          {/* Related Project */}
          {Array.isArray(testimonial.productIds) && testimonial.productIds.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href={`/proyek/${testimonial.productIds[0]}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                onClick={onClose}
              >
                Lihat Proyek Terkait →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (!testimonials || testimonials.length === 0) {
    return <p className="text-muted text-center py-12">Belum ada testimoni.</p>;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            tabIndex={0}
            role="button"
            aria-label={`View testimonial from ${t.name}`}
            onClick={() => setSelected(t)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(t);
              }
            }}
            className="rounded-xl border border-border bg-card p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          >
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
                <span className="text-xs text-primary hover:underline">
                  Lihat Proyek Terkait →
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <TestimonialModal testimonial={selected} onClose={close} />
      )}
    </>
  );
}

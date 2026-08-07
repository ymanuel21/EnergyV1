'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface TestimonialData {
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

function Modal({ t, onClose }: { t: TestimonialData; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition" aria-label="Close">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            {t.photo ? (
              <img src={t.photo} alt={t.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t.name}</h2>
              {(t.company || t.role) && (
                <p className="text-sm text-gray-500">{t.role}{t.role && t.company ? ' · ' : ''}{t.company}</p>
              )}
            </div>
          </div>
          <div className="flex mb-4 text-xl text-amber-400">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
          <blockquote className="text-gray-700 leading-relaxed text-sm sm:text-base">&ldquo;{t.quote}&rdquo;</blockquote>
        </div>
      </div>
    </div>
  );
}

interface Props {
  testimonial: TestimonialData;
  children: React.ReactNode;
}

/**
 * Wraps children with click-to-open-modal behavior.
 * Does NOT add any visual styling — the children's className is passed through exactly.
 * Only adds cursor-pointer, keyboard accessibility, and hover shadow.
 */
export function ClickableCard({ testimonial, children }: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div
        tabIndex={0}
        role="button"
        aria-label={`View testimonial from ${testimonial.name}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
        className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
      >
        {children}
      </div>
      {open && <Modal t={testimonial} onClose={close} />}
    </>
  );
}

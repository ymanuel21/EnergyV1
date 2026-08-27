'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TabCard {
  title: string;
  desc: string;
  image: string;
  link: string;
  accent: string;
}

interface SystemTypeTabsProps {
  cards: TabCard[];
}

export function SystemTypeTabs({ cards }: SystemTypeTabsProps) {
  const [active, setActive] = useState(0);
  const current = cards[active];
  if (!current) return null;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-8 overflow-x-auto -mx-1 px-1">
        {cards.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium transition-all border-2 ${
              i === active
                ? 'border-transparent text-white'
                : 'border-border bg-card text-muted hover:text-primary hover:border-primary/30'
            }`}
            style={i === active ? { backgroundColor: card.accent || '#e5e7eb' } : undefined}
          >
            {card.title}
          </button>
        ))}
      </div>

      {/* Active card */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden">
        {/* Image — full width, no cropping, natural aspect ratio */}
        {current.image && (
          <div className="bg-surface">
            <img
              src={current.image}
              alt={current.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Info */}
        <div className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-primary">{current.title}</h3>
          {current.desc && (
            <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed max-w-2xl">{current.desc}</p>
          )}
          {current.link && (
            <Link
              href={current.link}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
            >
              Pelajari Selengkapnya <span className="text-base">→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dot indicators (mobile) */}
      <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
        {cards.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-6' : 'w-2 bg-border'
            }`}
            style={i === active ? { backgroundColor: card.accent || '#e5e7eb' } : undefined}
            aria-label={card.title}
          />
        ))}
      </div>
    </div>
  );
}

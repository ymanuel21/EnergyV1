import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@ui/Container';
import { SectionHeading } from '@ui/SectionHeading';
import type { NeedCard } from '@/types/product';

interface NeedCardsProps {
  cards: NeedCard[];
}

export function NeedCards({ cards }: NeedCardsProps) {
  return (
    <section className="py-10">
      <Container>
        <SectionHeading
          title="Mulai dari kebutuhan Anda"
          align="center"
          className="mb-8"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <Image
                  src={card.image}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:gap-2 transition-all">
                {card.cta}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

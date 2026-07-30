import Link from 'next/link';
import type { FC } from 'react';

interface TrustPanelProps {
  title?: string;
  description?: string;
  benefits?: string[];
  buttonLabel?: string;
  buttonLink?: string;
}

const DEFAULT_BENEFITS = [
  'Produk Original & Bergaransi',
  'Konsultasi Gratis',
  'Dukungan Instalasi',
  'Pengiriman ke Seluruh Indonesia',
  'Tim Ahli Energi Terbarukan',
];

export const TrustPanel: FC<TrustPanelProps> = ({
  title = 'Mengapa Memilih EBTPlaza?',
  description,
  benefits = DEFAULT_BENEFITS,
  buttonLabel = 'Hubungi Tim Kami',
  buttonLink = '/permintaan-penawaran',
}) => {
  return (
    <div className="flex flex-col justify-center h-full rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white p-8 lg:p-10">
      {/* Icon */}
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
        <svg className="h-6 w-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted mb-4 leading-relaxed">{description}</p>
      )}

      <ul className="space-y-2.5 mb-6 flex-1">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <span className="text-sm text-primary/80">{benefit}</span>
          </li>
        ))}
      </ul>

      <Link
        href={buttonLink}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors w-fit"
      >
        {buttonLabel}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
};

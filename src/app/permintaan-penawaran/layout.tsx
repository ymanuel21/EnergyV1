import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Quote (RFQ)',
  description: 'Request a quotation for your renewable energy project needs. For contractors, companies and large-scale procurement.',
  alternates: { canonical: '/permintaan-penawaran' },
  robots: { index: false, follow: true },
};

import { Suspense } from 'react';

export default function RfqLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="py-12 text-center text-muted">Loading...</div>}>{children}</Suspense>;
}

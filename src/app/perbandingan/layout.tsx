import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perbandingan',
  description: 'Bandingkan produk energi terbarukan di Energi.Click.',
  alternates: { canonical: '/perbandingan' },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

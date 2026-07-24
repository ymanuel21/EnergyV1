import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perbandingan',
  description: 'Bandingkan produk energi terbarukan di EBTPlaza.',
  alternates: { canonical: '/perbandingan' },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

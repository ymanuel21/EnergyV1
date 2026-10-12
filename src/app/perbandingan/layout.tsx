import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparison',
  description: 'Compare renewable energy products at EBTPlaza.',
  alternates: { canonical: '/perbandingan' },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

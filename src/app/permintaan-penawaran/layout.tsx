import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Permintaan Penawaran (RFQ)',
  description: 'Ajukan permintaan penawaran untuk kebutuhan proyek energi terbarukan Anda. Untuk kontraktor, perusahaan, dan pengadaan skala besar.',
  alternates: { canonical: '/permintaan-penawaran' },
  robots: { index: false, follow: true },
};

export default function RfqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

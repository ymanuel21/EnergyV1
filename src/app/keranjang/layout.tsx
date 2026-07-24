import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keranjang Belanja',
  description: 'Keranjang belanja Anda di EBTPlaza.',
  alternates: { canonical: '/keranjang' },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

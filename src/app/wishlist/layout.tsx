import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Produk yang Anda simpan di wishlist EBTPlaza.',
  alternates: { canonical: '/wishlist' },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

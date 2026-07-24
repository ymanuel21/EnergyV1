import { HeroSlider } from '@components/home/HeroSlider';
import { NeedCards } from '@components/home/NeedCards';
import { ProductCarouselSection } from '@components/home/ProductCarouselSection';
import { banners, needCards } from '@/lib/data/banners';
import { products } from '@/lib/data/products';
import { OrganizationSchema } from '@components/ui/StructuredData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energi Cerdas, Tinggal Klik!',
  alternates: { canonical: '/' },
};

const clearanceProducts = products.filter((p) => p.badges.includes('clearance')).slice(0, 5);
const promoProducts = products.filter((p) => p.badges.includes('promo')).slice(0, 8);

export default async function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <HeroSlider banners={banners} />

      <NeedCards cards={needCards} />

      <ProductCarouselSection
        title="CLEARANCE"
        description="Stok terbatas • Termurah!"
        linkTo="/barang-clearance"
        products={clearanceProducts}
        titleIcon={
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        }
      />

      <ProductCarouselSection
        title="PROMO & PENAWARAN"
        description="Harga spesial • Hemat lebih banyak!"
        linkTo="/promo"
        products={promoProducts}
        titleIcon={
          <svg className="h-5 w-5 text-accent-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
          </svg>
        }
      />
    </>
  );
}

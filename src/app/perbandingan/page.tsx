'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
import { PriceDisplay } from '@components/product/PriceDisplay';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { EmptyState } from '@ui/EmptyState';
import { useCompare } from '@providers/CompareProvider';
import { useCart } from '@providers/CartProvider';
import { CompareIcon } from '@ui/Icons';
import type { Product, Brand } from '@/types/product';

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const { addItem } = useCart();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/brands').then(r => r.json()),
    ]).then(([products, brandsData]) => {
      setAllProducts(products);
      setBrands(brandsData);
      setProductsLoaded(true);
    }).catch(() => {
      setProductsLoaded(true); // still show UI even on error
    });
  }, []);

  const compareProducts = allProducts.filter((p) => items.includes(p.id));
  const getBrand = (brandId: string) => brands.find(b => b.id === brandId);

  function addToCart(productId: string) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    const brand = getBrand(product.brandId);
    addItem({
      productId: product.id, slug: product.slug, name: product.name,
      brandName: brand?.name ?? '', image: product.images[0],
      price: product.price, maxQuantity: product.stock, weight: product.weight,
    }, 1);
  }

  function handleBack() {
    if (window.history.length > 1) { router.back(); }
    else { router.push('/produk'); }
  }

  // ── Loading ──
  if (!productsLoaded) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
        <button onClick={handleBack} className="mt-4 flex items-center gap-1.5 text-sm text-muted hover:text-primary transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm text-muted">Memuat perbandingan...</p>
        </div>
      </Container>
    );
  }

  // ── Empty ──
  if (compareProducts.length === 0) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
        <button onClick={handleBack} className="mt-4 flex items-center gap-1.5 text-sm text-muted hover:text-primary transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <EmptyState
          icon={<CompareIcon className="h-12 w-12" />}
          title="Belum ada produk yang dibandingkan"
          description="Klik 'Bandingkan' di halaman produk untuk menambahkan ke sini. Maksimal 4 produk."
          action={{ label: 'Lihat Produk', href: '/produk' }}
          className="mt-12"
        />
      </Container>
    );
  }

  // ── Loaded ──
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
      <button onClick={handleBack} className="mt-4 flex items-center gap-1.5 text-sm text-muted hover:text-primary transition">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>
      <div className="mt-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-primary">Perbandingan Produk</h1><p className="mt-1 text-sm text-muted">{compareProducts.length}/4 produk dibandingkan</p></div>
        <Button variant="ghost" size="sm" onClick={clearAll}>Hapus semua</Button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left font-medium text-primary">Spesifikasi</th>
              {compareProducts.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <div className="space-y-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-surface">
                      <SafeImage src={p.images[0]} alt={p.name} fill className="object-contain p-2" sizes="200px" />
                      <button onClick={() => removeItem(p.id)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-muted hover:text-red-500 transition-colors shadow-sm" aria-label={`Hapus ${p.name}`}>✕</button>
                    </div>
                    <Link href={`/produk/${p.slug}`} className="block text-sm font-medium text-primary line-clamp-2">{p.name}</Link>
                    <PriceDisplay product={p} showDiscount />
                    <Button variant="primary" size="sm" className="w-full" onClick={() => addToCart(p.id)}>+ Keranjang</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([['Brand', (p: Product) => getBrand(p.brandId)?.name ?? '-'],['Kondisi', (p: Product) => p.condition === 'new' ? 'Baru' : 'Bekas'],['Garansi', (p: Product) => p.warranty],['Stok', (p: Product) => `${p.stock} pcs`],['Berat', (p: Product) => `${p.weight} kg`],] as [string, (p: Product) => string][]).map(([label, getValue]) => (
              <tr key={label} className="border-t border-border">
                <td className="p-3 font-medium text-primary">{label}</td>
                {compareProducts.map((p) => (<td key={p.id} className="p-3 text-muted">{getValue(p)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

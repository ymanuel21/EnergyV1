'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
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
  const [hydrated, setHydrated] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setAllProducts).catch(() => {});
    fetch('/api/brands').then(r => r.json()).then(setBrands).catch(() => {});
  }, []);

  const compareProducts = allProducts.filter((p) => items.includes(p.id));
  const getBrand = (brandId: string) => brands.find(b => b.id === brandId);

  if (!hydrated) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
        <div className="mt-4"><h1 className="text-2xl font-bold text-gray-900">Perbandingan Produk</h1></div>
      </Container>
    );
  }

  function addToCart(productId: string) {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    const brand = getBrand(product.brandId);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandName: brand?.name ?? '',
      image: product.images[0],
      price: product.price,
      maxQuantity: product.stock,
      weight: product.weight,
    }, 1);
  }

  if (compareProducts.length === 0) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
        <EmptyState
          icon={<CompareIcon className="h-12 w-12" />}
          title="Belum ada produk yang dibandingkan"
          description="Maksimal 4 produk. Klik 'Bandingkan' di halaman produk untuk memulai."
          action={{ label: 'Lihat Produk', href: '/produk' }}
          className="mt-12"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Perbandingan' }]} />
      <div className="mt-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Perbandingan Produk</h1><p className="mt-1 text-sm text-gray-500">{compareProducts.length}/4 produk dibandingkan</p></div>
        <Button variant="ghost" size="sm" onClick={clearAll}>Hapus semua</Button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left font-medium text-gray-700">Spesifikasi</th>
              {compareProducts.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <div className="space-y-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-100">
                      <SafeImage src={p.images[0]} alt={p.name} fill className="object-contain p-2" sizes="200px" />
                      <button onClick={() => removeItem(p.id)} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-400 hover:text-red-500 transition-colors shadow-sm" aria-label={`Hapus ${p.name}`}>✕</button>
                    </div>
                    <Link href={`/produk/${p.slug}`} className="block text-sm font-medium text-gray-900 line-clamp-2">{p.name}</Link>
                    <p className="text-lg font-bold text-gray-900">Rp {p.price.toLocaleString('id-ID')}</p>
                    <Button variant="primary" size="sm" className="w-full" onClick={() => addToCart(p.id)}>+ Keranjang</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([['Brand', (p: Product) => getBrand(p.brandId)?.name ?? '-'],['Kondisi', (p: Product) => p.condition === 'new' ? 'Baru' : 'Bekas'],['Garansi', (p: Product) => p.warranty],['Stok', (p: Product) => `${p.stock} pcs`],['Berat', (p: Product) => `${p.weight} kg`],] as [string, (p: Product) => string][]).map(([label, getValue]) => (
              <tr key={label} className="border-t border-gray-100">
                <td className="p-3 font-medium text-gray-700">{label}</td>
                {compareProducts.map((p) => (<td key={p.id} className="p-3 text-gray-600">{getValue(p)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

'use client';

import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { EmptyState } from '@ui/EmptyState';
import { ProductCard } from '@components/product/ProductCard';
import { useWishlist } from '@providers/WishlistProvider';
import { useCart } from '@providers/CartProvider';
import { products } from '@/lib/data/products';
import { getBrandById } from '@/lib/data/brands';
import { HeartIcon } from '@ui/Icons';

export default function WishlistPage() {
  const { items, removeItem, clearAll } = useWishlist();
  const { addItem } = useCart();

  const wishlistProducts = products.filter((p) => items.includes(p.id));

  function handleAddToCart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const brand = getBrandById(product.brandId);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brandName: brand?.name ?? '',
        image: product.images[0],
        price: product.price,
        maxQuantity: product.stock,
        weight: product.weight,
      },
      1
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Wishlist' }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} produk disimpan
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Hapus semua
          </Button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-12 w-12" />}
          title="Wishlist kosong"
          description="Simpan produk yang Anda sukai dengan mengklik ikon hati di produk."
          action={{ label: 'Mulai Belanja', href: '/produk' }}
          className="mt-12"
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} variant="grid" />
              <div className="mt-2 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddToCart(product.id)}
                >
                  + Keranjang
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(product.id)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}

'use client';

import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { QuantitySelector } from '@components/product/QuantitySelector';
import { EmptyState } from '@ui/EmptyState';
import { useCart } from '@providers/CartProvider';
import { CartIcon } from '@ui/Icons';
import { formatCurrency } from '@lib/utils/format';

export default function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <Container className="py-6">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        <EmptyState
          icon={<CartIcon className="h-12 w-12" />}
          title="Keranjang kosong"
          description="Tambahkan produk ke keranjang untuk mulai berbelanja."
          action={{ label: 'Mulai Belanja', href: '/produk' }}
          className="mt-12"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Keranjang' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        <p className="mt-1 text-sm text-gray-500">{cart.itemCount} item</p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-lg border border-gray-200 p-4"
            >
              <Link
                href={`/produk/${item.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
              >
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/produk/${item.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand-700 line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500">{item.brandName}</p>
                </div>

                <div className="flex items-center justify-between">
                  <QuantitySelector
                    value={item.quantity}
                    max={item.maxQuantity}
                    onChange={(qty) => cart.updateQuantity(item.productId, qty)}
                  />
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.price)} / item
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => cart.removeItem(item.productId)}
                  className="self-end text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Belanja</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cart.itemCount} item)</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Berat total</span>
              <span>{cart.totalWeight} kg</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Pengiriman</span>
              <span className="text-gray-400">Dihitung saat checkout</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button variant="primary" size="lg" className="w-full">
              Lanjutkan ke Pembayaran
            </Button>
          </Link>

          <Link
            href="/produk"
            className="block text-center text-sm text-brand-700 hover:underline"
          >
            ← Lanjutkan belanja
          </Link>
        </div>
      </div>
    </Container>
  );
}

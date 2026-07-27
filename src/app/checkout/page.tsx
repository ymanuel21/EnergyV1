'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { EmptyState } from '@ui/EmptyState';
import { useCart } from '@providers/CartProvider';
import { formatCurrency } from '@lib/utils/format';
import { createOrderPayload, saveOrderToSheets, buildWhatsAppMessage } from '@lib/api/sheets';
import { CartIcon } from '@ui/Icons';
import type { Metadata } from 'next';
import { SITE } from '@lib/constants';

const WA_NUMBER = '6282112850215';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const cart = useCart();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'transfer',
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const orderItems = cart.items.map((item) => ({
      productName: item.name,
      sku: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const order = createOrderPayload(
      formData.name,
      formData.email,
      formData.phone,
      formData.address,
      formData.city,
      formData.postalCode,
      formData.notes,
      formData.paymentMethod,
      orderItems,
      cart.subtotal
    );

    saveOrderToSheets(order).then(() => {
      const waUrl = buildWhatsAppMessage(WA_NUMBER, order);
      cart.clearCart();
      window.open(waUrl, '_blank');
    });
  }

  if (cart.items.length === 0) {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Checkout' }]} />
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <EmptyState
          icon={<CartIcon className="h-12 w-12" />}
          title="Keranjang kosong"
          description="Tambahkan produk ke keranjang sebelum checkout."
          action={{ label: 'Mulai Belanja', href: '/produk' }}
          className="mt-12"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Keranjang', href: '/keranjang' },
          { label: 'Checkout' },
        ]}
      />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        {(['shipping', 'payment', 'review'] as CheckoutStep[]).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step === s
                  ? 'bg-gray-800 text-white'
                  : s < step || (s === 'shipping' && step !== 'shipping')
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i + 1}
            </span>
            <span className={step === s ? 'font-medium text-gray-900' : 'text-gray-400'}>
              {s === 'shipping' ? 'Pengiriman' : s === 'payment' ? 'Pembayaran' : 'Review'}
            </span>
            {i < 2 && <span className="text-gray-300 mx-1">→</span>}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {step === 'shipping' && (
            <div className="space-y-4 rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Informasi Pengiriman</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-sm font-medium text-gray-700 mb-1">Kota *</label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="checkout-address" className="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
                <textarea
                  id="checkout-address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none resize-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Opsional: catatan untuk kurir"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const name = formData.name.trim();
                    const email = formData.email.trim();
                    const city = formData.city.trim();
                    const address = formData.address.trim();
                    if (!name || !email || !city || !address) {
                      alert('Mohon isi Nama, Email, Kota, dan Alamat terlebih dahulu.');
                      return;
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      alert('Format email tidak valid.');
                      return;
                    }
                    setStep('payment');
                  }}
                >
                  Lanjutkan →
                </Button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4 rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
              <div className="space-y-3">
                {[
                  { value: 'transfer', label: 'Transfer Bank (BCA, Mandiri, BRI, BNI)', icon: '🏦' },
                  { value: 'va', label: 'Virtual Account', icon: '📱' },
                  { value: 'qris', label: 'QRIS', icon: '📲' },
                  { value: 'cod', label: 'COD (Bayar di Tempat)', icon: '💵' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      formData.paymentMethod === method.value
                        ? 'border-gray-700 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => updateField('paymentMethod', e.target.value)}
                      className="text-gray-800 focus:ring-gray-700"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{method.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep('shipping')}>
                  ← Kembali
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep('review')}>
                  Review Pesanan →
                </Button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4 rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Review Pesanan</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Pengiriman ke:</p>
                  <p className="text-gray-600">{formData.name}</p>
                  <p className="text-gray-600">{formData.address}, {formData.city} {formData.postalCode}</p>
                  <p className="text-gray-600">{formData.email} • {formData.phone}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Pembayaran:</p>
                  <p className="text-gray-600">
                    {formData.paymentMethod === 'transfer' ? 'Transfer Bank' : formData.paymentMethod.toUpperCase()}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <p className="font-medium text-gray-700">Items:</p>
                  {cart.items.map((item) => (
                    <p key={item.productId} className="text-gray-600">
                      {item.quantity}× {item.name} — {formatCurrency(item.price * item.quantity)}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep('payment')}>
                  ← Kembali
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Buat Pesanan — {formatCurrency(cart.subtotal)}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Order summary sidebar */}
        <div className="h-fit rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pesanan Anda</h2>
          <div className="divide-y divide-gray-100">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3 py-2">
                <span className="text-sm text-gray-600 w-6">{item.quantity}×</span>
                <span className="flex-1 text-sm text-gray-900 line-clamp-1">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

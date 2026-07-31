'use client';

import { useState, type FormEvent, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { RequiredLabel } from '@ui/RequiredLabel';
import { FormLabel } from '@ui/FormLabel';
import { ProductAutocomplete } from '@components/forms/ProductAutocomplete';
import { useCart } from '@providers/CartProvider';
import { SITE } from '@lib/constants';
import { formatCurrency } from '@lib/utils/format';
import type { RfqItem } from '@/types/forms';

type Step = 'form' | 'confirm';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  items?: string;
}

export default function RfqPage() {
  const cart = useCart();
  const [step, setStep] = useState<Step>('form');
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    customerType: 'RESIDENTIAL' as 'RESIDENTIAL' | 'BUSINESS',
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    projectName: '',
    location: '',
    targetDate: '',
    needsInstallation: false,
    notes: '',
  });
  const [items, setItems] = useState<RfqItem[]>(() => []);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, notes: '' });
  const [itemError, setItemError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Project context auto-fill ──
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');

  useEffect(() => {
    if (!projectSlug) return;
    (async () => {
      try {
        const res = await fetch(`/api/projects?slug=${encodeURIComponent(projectSlug)}`);
        if (!res.ok) throw new Error('not found');
        const project = await res.json();
        if (!project) return;

        // Build items from project's linked products
        const newItems: RfqItem[] = [];
        if (Array.isArray(project.productIds) && project.productIds.length > 0) {
          for (const pid of project.productIds) {
            newItems.push({ name: pid, quantity: 1, notes: 'Dari proyek referensi' });
          }
        } else {
          // Fallback: generic item
          newItems.push({
            name: `Solusi serupa dengan proyek: ${project.title}`,
            quantity: 1,
            notes: `Referensi: ${project.slug}`,
          });
        }

        setItems(prev => {
          // Don't overwrite existing items if user already has some
          if (prev.length > 0) return prev;
          return newItems;
        });

        setForm(prev => ({
          ...prev,
          location: project.location || prev.location,
          projectName: prev.projectName || project.title || '',
          notes: prev.notes
            ? prev.notes
            : `Proyek Referensi:\n${project.title}\n\nLokasi: ${project.location || '—'}\n\nDiminta: Solusi energi terbarukan serupa.`,
        }));

        showToast(`✅ RFQ otomatis dibuat dari ${project.title}`);
      } catch {
        showToast('⚠️ Proyek tidak ditemukan');
      }
    })();
  }, [projectSlug]); // only run when projectSlug changes
  // ── Cart import ──
  const importFromCart = useCallback(() => {
    const cartItems: RfqItem[] = cart.items.map((i) => ({
      name: `${i.quantity}× ${i.name} (${i.brandName})`,
      quantity: 1,
      notes: `SKU ref: ${i.slug} — ${formatCurrency(i.price)}/item`,
    }));
    setItems((prev) => [...prev, ...cartItems]);
  }, [cart.items]);

  // ── Add item ──
  function addItem() {
    setItemError(null);
    const name = newItem.name.trim();
    if (!name)  { setItemError('Nama barang wajib diisi.'); return; }
    if (newItem.quantity < 1) { setItemError('Jumlah minimal 1.'); return; }

    setItems((prev) => [...prev, { name, quantity: newItem.quantity, notes: newItem.notes || undefined }]);
    showToast(`✅ ${name} berhasil ditambahkan.`);
    setNewItem({ name: '', quantity: 1, notes: '' });
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // ── Validation ──
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email tidak valid';
    if (!form.phone.trim()) e.phone = 'Telepon wajib diisi';
    if (form.customerType === 'BUSINESS' && !form.company.trim()) e.company = 'Nama perusahaan wajib diisi';
    if (items.length === 0) e.items = 'Minimal 1 item';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit → WhatsApp ──
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStep('confirm');
  }

  function buildWhatsAppMessage(): string {
    const lines = [
      `*Permintaan Penawaran — ${SITE.name}*`,
      '',
      `*Kontak:*`,
      `*Customer:* ${form.customerType === 'BUSINESS' ? 'Business / Corporate' : 'Residential'}`,
      `*Nama:* ${form.name}`,
      `*Email:* ${form.email}`,
      form.phone ? `*Telp:* ${form.phone}` : '',
      form.company ? `*Perusahaan:* ${form.company}` : '',
      form.position ? `*Jabatan:* ${form.position}` : '',
      '',
      `*Proyek:*`,
      form.projectName ? `Nama Proyek: ${form.projectName}` : '',
      form.location ? `Lokasi: ${form.location}` : '',
      form.targetDate ? `Target: ${form.targetDate}` : '',
      form.needsInstallation ? 'Butuh jasa instalasi: Ya' : '',
      form.notes ? `Catatan: ${form.notes}` : '',
      '',
      `*Daftar Kebutuhan (${items.length} item):*`,
      ...items.map((item, i) =>
        `  ${i + 1}. ${item.name} — Qty: ${item.quantity}${item.notes ? ` (${item.notes})` : ''}`
      ),
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  }

  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${buildWhatsAppMessage()}`;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (step === 'confirm') {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Permintaan Penawaran' }]} />

        <div className="mx-auto mt-8 max-w-lg text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Permintaan Terkirim!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tim kami akan menghubungi Anda dalam 1×24 jam kerja.
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 p-4 text-left text-sm">
            <p className="font-medium text-gray-700">Ringkasan:</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>👤 {form.name} — {form.email}</li>
              <li>📦 {items.length} item ({itemCount} unit)</li>
              {form.company && <li>🏢 {form.company}</li>}
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 transition-colors"
              data-track="rfq-whatsapp-send"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Kirim via WhatsApp
            </a>
            <Button variant="outline" onClick={() => { setStep('form'); }}>
              ← Buat permintaan baru
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Permintaan Penawaran' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Permintaan Penawaran (RFQ)</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lengkapi formulir di bawah ini. Anda dapat menambahkan item dari keranjang atau manual.
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 animate-scale-in" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-8" data-track="rfq-form">
        {/* ── Customer Type ── */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-3">
          <RequiredLabel>Customer Type</RequiredLabel>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="customerType"
                value="RESIDENTIAL"
                checked={form.customerType === 'RESIDENTIAL'}
                onChange={() => setForm((prev) => ({ ...prev, customerType: 'RESIDENTIAL' }))}
                className="accent-primary"
              />
              <span className={`text-sm font-medium ${form.customerType === 'RESIDENTIAL' ? 'text-primary' : 'text-muted'}`}>Residential</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="customerType"
                value="BUSINESS"
                checked={form.customerType === 'BUSINESS'}
                onChange={() => setForm((prev) => ({ ...prev, customerType: 'BUSINESS' }))}
                className="accent-primary"
              />
              <span className={`text-sm font-medium ${form.customerType === 'BUSINESS' ? 'text-primary' : 'text-muted'}`}>Business / Corporate</span>
            </label>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informasi Kontak</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <RequiredLabel htmlFor="rfq-name">Nama</RequiredLabel>
              <input
                id="rfq-name" required aria-required="true"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                  errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'
                }`}
                data-track="rfq-field-name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <RequiredLabel htmlFor="rfq-email">Email</RequiredLabel>
              <input
                id="rfq-email" required aria-required="true"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                  errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'
                }`}
                data-track="rfq-field-email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <RequiredLabel>Telepon / WhatsApp</RequiredLabel>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'}`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              {form.customerType === 'BUSINESS' ? (
                <>
                  <RequiredLabel>Nama Perusahaan</RequiredLabel>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${errors.company ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-gray-700 focus:ring-gray-700'}`}
                  />
                  {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company}</p>}
                </>
              ) : (
                <>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 opacity-50"
                    placeholder="Opsional"
                  />
                </>
              )}
            </div>
            {form.customerType === 'BUSINESS' && (
              <div>
                <FormLabel>Jabatan</FormLabel>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                  placeholder="Opsional"
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Project ── */}
        <section className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detail Proyek</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel>Nama Proyek</FormLabel>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
            <div>
              <FormLabel>Lokasi Proyek</FormLabel>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
            <div>
              <FormLabel>Target Pengadaan</FormLabel>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => updateField('targetDate', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.needsInstallation}
                  onChange={(e) => updateField('needsInstallation', e.target.checked)}
                  className="rounded border-gray-300 text-gray-800 focus:ring-gray-700"
                />
                <span className="text-sm text-gray-700">Membutuhkan jasa instalasi</span>
              </label>
            </div>
          </div>
          <div>
            <FormLabel>Catatan Teknis</FormLabel>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 resize-none"
              placeholder="Spesifikasi teknis, preferensi brand, atau kebutuhan khusus..."
            />
          </div>
        </section>

        {/* ── Items ── */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <RequiredLabel>Daftar Kebutuhan</RequiredLabel>
            {cart.items.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={importFromCart} data-track="rfq-import-cart">
                📋 Import dari keranjang ({cart.itemCount})
              </Button>
            )}
          </div>

          {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

          {/* Existing items */}
          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}{item.notes ? ` • ${item.notes}` : ''}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400">{itemCount} unit total</p>
            </div>
          )}

          {/* Add item */}
          <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
            <ProductAutocomplete
              id="rfq-product"
              name="rfq-product"
              placeholder="Nama Barang"
              onSelect={(product) => setNewItem((prev) => ({ ...prev, name: product.name }))}
            />
            <input
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
            <Button type="button" variant="outline" size="sm" onClick={addItem} data-track="rfq-add-item">
              + Tambah
            </Button>
          </div>
          {itemError && (
            <p className="text-xs text-red-500 animate-scale-in" role="alert">{itemError}</p>
          )}
          <input
            type="text"
            placeholder="Catatan item (opsional)"
            value={newItem.notes}
            onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
          />
        </section>

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" data-track="rfq-submit">
            Kirim Permintaan
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => window.history.back()}>
            Batal
          </Button>
        </div>
      </form>
    </Container>
  );
}

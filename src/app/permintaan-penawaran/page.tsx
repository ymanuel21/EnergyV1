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
import { useSite } from '@providers/SiteProvider';
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
  const site = useSite();
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
  const [items, setItems] = useState<RfqItem[]>(() => {
    // Restore from sessionStorage if available
    if (typeof window !== 'undefined') {
      try { const saved = sessionStorage.getItem('rfq-items'); if (saved) return JSON.parse(saved); } catch {}
    }
    return [];
  });

  // Persist items to sessionStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rfq-items', JSON.stringify(items));
    }
  }, [items]);

  const [newItem, setNewItem] = useState({ name: '', quantity: 1, notes: '' });
  const [itemError, setItemError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function resetForm() {
    setItems([]);
    if (typeof window !== 'undefined') sessionStorage.removeItem('rfq-items');
    setForm({
      customerType: 'RESIDENTIAL',
      name: '', email: '', phone: '', company: '', position: '',
      projectName: '', location: '', targetDate: '',
      needsInstallation: false, notes: '',
    });
  }

  // ── Project context auto-fill ──
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const [importedSlug, setImportedSlug] = useState<string | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [pendingProjectItems, setPendingProjectItems] = useState<RfqItem[]>([]);
  const [pendingProject, setPendingProject] = useState<any>(null);

  useEffect(() => {
    if (!projectSlug || projectSlug === importedSlug) return;

    (async () => {
      try {
        const res = await fetch(`/api/projects?slug=${encodeURIComponent(projectSlug)}`);
        if (!res.ok) throw new Error('not found');
        const project = await res.json();
        if (!project) return;

        // Build items from project's linked products
        const newItems: RfqItem[] = [];
        const rawIds: any[] = Array.isArray(project.productIds) ? project.productIds : [];

        if (rawIds.length > 0) {
          for (const item of rawIds.slice(0, 50)) {
            const slug = typeof item === 'string' ? item : item.slug || item.productId || '';
            const qty = typeof item === 'string' ? 1 : (item.quantity || 1);
            try {
              const pRes = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
              if (pRes.ok) {
                const prod = await pRes.json();
                // Take first product from array response
                const p = Array.isArray(prod) ? prod[0] : prod;
                newItems.push({ name: p?.name || slug, quantity: qty, notes: `From project: ${project.title}` });
              } else {
                newItems.push({ name: `[Removed] ${slug}`, quantity: 1, notes: 'Product unavailable — needs review' });
              }
            } catch {
              newItems.push({ name: slug, quantity: 1, notes: 'Product verification failed' });
            }
          }
        } else {
          // Fallback: generic item
          newItems.push({
            name: `Solutions similar to the project: ${project.title}`,
            quantity: 1,
            notes: `Referensi: ${project.slug}`,
          });
        }

        // Check if user already has items → show merge dialog
        if (items.length > 0 && !showMergeDialog) {
          setPendingProjectItems(newItems);
          setPendingProject(project);
          setShowMergeDialog(true);
          return;
        }

        applyProjectItems(newItems, project);
      } catch {
        showToast('⚠️ Project not found');
      }
    })();
  }, [projectSlug, importedSlug]);

  function applyProjectItems(newItems: RfqItem[], project: any) {
    setItems(newItems);
    setImportedSlug(project.slug);
    setShowMergeDialog(false);

    setForm(prev => ({
      ...prev,
      location: project.location || prev.location,
      projectName: project.title || prev.projectName,
      notes: prev.notes || `Reference Project:\n${project.title}\n\nLocation: ${project.location || '—'}\n\nRequested: A similar renewable energy solution.\n\nSource Project: ${project.slug}`,
    }));

    // Clear sessionStorage for this project import
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('rfq-source-project', project.slug);
    }

    showToast(`✅ RFQ filled from ${project.title}`);
  }

  function handleMergeAppend() {
    setItems(prev => [...prev, ...pendingProjectItems]);
    if (pendingProject) {
      setForm(prev => ({
        ...prev,
        notes: prev.notes + `\n\n+ Added from: ${pendingProject.title} (${pendingProject.slug})`,
      }));
    }
    setImportedSlug(pendingProject?.slug || null);
    setShowMergeDialog(false);
    showToast(`✅ ${pendingProjectItems.length} items added from ${pendingProject?.title}`);
  }

  function handleMergeReplace() {
    if (pendingProject) applyProjectItems(pendingProjectItems, pendingProject);
  }

  function handleMergeCancel() {
    setShowMergeDialog(false);
    setPendingProjectItems([]);
    setPendingProject(null);
  }
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
    if (!name)  { setItemError('Item name is required.'); return; }
    if (newItem.quantity < 1) { setItemError('Minimum quantity is 1.'); return; }

    setItems((prev) => [...prev, { name, quantity: newItem.quantity, notes: newItem.notes || undefined }]);
    showToast(`✅ ${name} added.`);
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
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (form.customerType === 'BUSINESS' && !form.company.trim()) e.company = 'Company name is required';
    if (items.length === 0) e.items = 'At least 1 item';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit → save to DB then show confirm ──
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Build message from items + project context
      const itemLines = items.map((item, i) =>
        `  ${i + 1}. ${item.name} — Qty: ${item.quantity}${item.notes ? ` (${item.notes})` : ''}`
      );
      const messageParts = [
        `Customer type: ${form.customerType === 'BUSINESS' ? 'Business / Corporate' : 'Residential'}`,
        form.company ? `Company: ${form.company}` : '',
        form.position ? `Jabatan: ${form.position}` : '',
        form.projectName ? `Project name: ${form.projectName}` : '',
        form.location ? `Location: ${form.location}` : '',
        form.targetDate ? `Target: ${form.targetDate}` : '',
        form.needsInstallation ? 'Installation service needed: Yes' : '',
        form.notes ? `Note: ${form.notes}` : '',
        `--- Requirements List (${items.length} items) ---`,
        ...itemLines,
      ];
      const message = messageParts.filter(Boolean).join('\n');

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
          message,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }

      // Clear cart after successful submission
      cart.clearCart();

      setSubmitting(false);
      setStep('confirm');
    } catch (err: any) {
      setSubmitting(false);
      setSubmitError(err?.message || 'Failed to send. Please try again.');
    }
  }

  function buildWhatsAppMessage(): string {
    const lines = [
      `*Quotation Request — ${site.name}*`,
      '',
      `*Contact:*`,
      `*Customer:* ${form.customerType === 'BUSINESS' ? 'Business / Corporate' : 'Residential'}`,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      form.phone ? `*Telp:* ${form.phone}` : '',
      form.company ? `*Company:* ${form.company}` : '',
      form.position ? `*Jabatan:* ${form.position}` : '',
      '',
      `*Project:*`,
      form.projectName ? `Project name: ${form.projectName}` : '',
      form.location ? `Location: ${form.location}` : '',
      form.targetDate ? `Target: ${form.targetDate}` : '',
      form.needsInstallation ? 'Installation service needed: Yes' : '',
      form.notes ? `Note: ${form.notes}` : '',
      '',
      `*Requirements List (${items.length} items):*`,
      ...items.map((item, i) =>
        `  ${i + 1}. ${item.name} — Qty: ${item.quantity}${item.notes ? ` (${item.notes})` : ''}`
      ),
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  }

  const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${buildWhatsAppMessage()}`;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (step === 'confirm') {
    return (
      <Container className="py-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Request a Quote' }]} />

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
            Our team will contact you within 1×24 working hours.
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
              Send via WhatsApp
            </a>
            <Button variant="outline" onClick={() => { resetForm(); setStep('form'); }}>
              ← Create a new request
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Request a Quote' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Request a Quote (RFQ)</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete the form below. You can add items from your cart or manually.
        </p>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 animate-scale-in" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-8" data-track="rfq-form">

        {/* Merge dialog */}
        {showMergeDialog && (
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-5 animate-scale-in" role="dialog">
            <p className="text-sm font-semibold text-primary mb-1">You already have {items.length} items in the RFQ</p>
            <p className="text-xs text-muted mb-3">
              {pendingProjectItems.length} items from project &quot;{pendingProject?.title}&quot; ready to add.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={handleMergeAppend}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">
                ➕ Add ({pendingProjectItems.length})
              </button>
              <button type="button" onClick={handleMergeReplace}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">
                🔄 Replace all
              </button>
              <button type="button" onClick={handleMergeCancel}
                className="rounded-lg px-4 py-2 text-sm text-muted hover:text-primary transition">
                Cancel
              </button>
            </div>
          </div>
        )}
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
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <RequiredLabel htmlFor="rfq-name">Name</RequiredLabel>
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
              <RequiredLabel>Phone / WhatsApp</RequiredLabel>
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
                  <RequiredLabel>Company Name</RequiredLabel>
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
                  <FormLabel>Company Name</FormLabel>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 opacity-50"
                    placeholder="Optional"
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
                  placeholder="Optional"
                />
              </div>
            )}
          </div>
        </section>

        {/* ── Project ── */}
        <section className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel>Project Name</FormLabel>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>
            <div>
              <FormLabel>Project Location</FormLabel>
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
                <span className="text-sm text-gray-700">Requires installation service</span>
              </label>
            </div>
          </div>
          <div>
            <FormLabel>Technical Notes</FormLabel>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 resize-none"
              placeholder="Technical specifications, brand preferences, or special requirements..."
            />
          </div>
        </section>

        {/* ── Items ── */}
        <section className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <RequiredLabel>Requirements List</RequiredLabel>
            {cart.items.length > 0 && (
              <button type="button"
                onClick={importFromCart}
                data-track="rfq-import-cart"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] h-8 px-3 border border-primary text-primary hover:bg-surface"
              >
                📋 Import from cart ({cart.itemCount})
              </button>
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
              placeholder="Item Name"
              onSelect={(product) => setNewItem((prev) => ({ ...prev, name: product.name }))}
            />
            <input
              type="number"
              min={1}
              value={newItem.quantity}
              onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
            <button type="button"
              onClick={addItem}
              data-track="rfq-add-item"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] h-8 px-3 border border-primary text-primary hover:bg-surface"
            >
              + Add
            </button>
          </div>
          {itemError && (
            <p className="text-xs text-red-500 animate-scale-in" role="alert">{itemError}</p>
          )}
          <input
            type="text"
            placeholder="Item note (optional)"
            value={newItem.notes}
            onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
          />
        </section>

        {/* ── Submit ── */}
        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3" role="alert">
            {submitError}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" disabled={submitting} data-track="rfq-submit">
            {submitting ? 'Mengirim...' : 'Send Request'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}

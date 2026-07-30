export const dynamic = "force-dynamic";

import { revalidatePath } from 'next/cache';
import { getPrisma } from '@/lib/db';
import { clearPricingCache } from '@/lib/services/product-pricing';
import { SettingsClientWrapper } from './SettingsClientWrapper';

async function getSettings() {
  const prisma = await getPrisma();
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export default async function SettingsPage() {
  const saved = await getSettings();

  async function handleSave(data: FormData) {
    'use server';
    const { getAdminPrisma } = await import('../lib/admin-prisma');
    const prisma = await getAdminPrisma();
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string' && key !== '_action') {
        await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
      }
    }
    revalidatePath('/admin/settings');
    clearPricingCache();
  }

  const siteFields = [
    { key: 'name', label: 'Nama Situs', defaultValue: 'EBTPlaza' },
    { key: 'tagline', label: 'Tagline', defaultValue: 'Energi Terbarukan, Harga Terjangkau!' },
    { key: 'email', label: 'Email', defaultValue: 'info@ebtplaza.com' },
    { key: 'phone', label: 'Telepon', defaultValue: '(022) 20522279' },
    { key: 'whatsapp', label: 'WhatsApp', defaultValue: '6282112850215' },
    { key: 'address', label: 'Alamat', defaultValue: 'Jl. Terusan Jakarta, Puri Dago Raya No.342, Bandung' },
    { key: 'description', label: 'SEO Description', defaultValue: 'Pusat produk energi terbarukan...' },
  ];

  const PRICE_MODES = [
    { value: 'SHOW_PRICE', label: 'Show Price (Tampilkan Harga)' },
    { value: 'STARTING_FROM', label: 'Starting From (Mulai Dari)' },
    { value: 'CONTACT_FOR_PRICE', label: 'Contact for Price (Hubungi Kami)' },
    { value: 'REQUEST_QUOTE', label: 'Request Quote (Minta Penawaran)' },
    { value: 'CUSTOM_TEXT', label: 'Custom Message (Teks Kustom)' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>

      <SettingsClientWrapper handleSave={handleSave}>
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold text-primary">Informasi Situs</h2>
          {siteFields.map((s) => (
            <div key={s.key}>
              <label className="block text-sm font-medium text-primary mb-1">{s.label}</label>
              <input name={s.key} defaultValue={saved[s.key] || s.defaultValue} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
          ))}
        </div>

        {/* Product Display */}
        <div className="mt-6 space-y-4 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold text-primary">Product Pricing Display</h2>
          <p className="text-sm text-muted">Kontrol bagaimana harga ditampilkan di seluruh situs. Produk individual dapat override pengaturan ini.</p>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Default Price Display Mode</label>
            <select name="product_price_display_mode" defaultValue={saved['product_price_display_mode'] || 'SHOW_PRICE'} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
              {PRICE_MODES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Custom Price Label</label>
            <input name="product_custom_price_label" defaultValue={saved['product_custom_price_label'] || ''} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Digunakan saat mode CUSTOM_TEXT dipilih" />
          </div>
        </div>
      </SettingsClientWrapper>
    </div>
  );
}

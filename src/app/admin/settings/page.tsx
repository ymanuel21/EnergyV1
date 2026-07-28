export const dynamic = "force-dynamic";

import { revalidatePath } from 'next/cache';

export default function SettingsPage() {
  async function handleSave(data: FormData) {
    'use server';
    // Settings update stub — writes to DB via prisma.siteSetting.upsert
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    for (const [key, value] of data.entries()) {
      if (typeof value === 'string' && key !== '_action') {
        await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
      }
    }
    revalidatePath('/admin/settings');
  }

  const settings = [
    { key: 'name', label: 'Nama Situs', defaultValue: 'EBTPlaza' },
    { key: 'tagline', label: 'Tagline', defaultValue: 'Energi Terbarukan, Harga Terjangkau!' },
    { key: 'email', label: 'Email', defaultValue: 'info@ebtplaza.com' },
    { key: 'phone', label: 'Telepon', defaultValue: '(022) 20522279' },
    { key: 'whatsapp', label: 'WhatsApp', defaultValue: '6282112850215' },
    { key: 'address', label: 'Alamat', defaultValue: 'Jl. Terusan Jakarta, Puri Dago Raya No.342, Bandung' },
    { key: 'description', label: 'SEO Description', defaultValue: 'Pusat produk energi terbarukan...' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>
      <form action={handleSave} className="mt-6 space-y-4 rounded-xl border bg-card p-6">
        {settings.map((s) => (
          <div key={s.key}>
            <label className="block text-sm font-medium text-primary mb-1">{s.label}</label>
            <input name={s.key} defaultValue={s.defaultValue} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
          </div>
        ))}
        <div className="flex justify-end">
          <button type="submit" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white">Simpan Pengaturan</button>
        </div>
      </form>
    </div>
  );
}

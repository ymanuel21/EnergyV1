import Link from 'next/link';
import { OrganizationSchema } from '@components/ui/StructuredData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Energi Cerdas, Tinggal Klik!',
  alternates: { canonical: '/' },
};

const CATEGORIES = [
  { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial — efisiensi tinggi untuk setiap kebutuhan', s:'panel-surya' },
  { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro — konversi daya yang andal', s:'inverter' },
  { n:'Baterai', d:'Lithium LiFePO4, Rack Mounted, Wall, All-in-One ESS', s:'baterai' },
  { n:'Paket PLTS', d:'Solusi lengkap untuk rumah, kantor, dan industri', s:'paket-plts' },
];

const BRANDS = ['MITSUBISHI ELECTRIC','CANADIAN SOLAR','LONGi','BLUETTI','BEZVOLT','AIKO','GH SOLAR','SRNE'];

export default async function HomePage() {
  return (
    <>
      <OrganizationSchema />

      {/* ===== HERO — Warm gradient ===== */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAF5 40%, #F5F5F0 100%)' }}>
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-amber-50/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-5xl items-center gap-16 px-8 py-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.25em] text-gray-400">Energi Terbarukan</p>
            <h1 className="mt-6 text-4xl font-light leading-tight tracking-tight text-gray-900 lg:text-6xl">
              Tenaga surya<br />
              <span className="font-semibold">untuk semua.</span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-gray-500 max-w-md">
              Produk berkualitas premium, dikurasi dengan cermat. Dari panel hingga sistem lengkap — kami membuat energi bersih menjadi sederhana.
            </p>
            <div className="mt-10 flex gap-3">
              <Link href="/produk" className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10 transition">Jelajahi Katalog</Link>
              <Link href="/permintaan-penawaran" className="rounded-full px-8 py-3.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition">Minta Penawaran →</Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl bg-white shadow-2xl shadow-gray-900/5 ring-1 ring-gray-900/5">
              <img src="/images/prototype/hero-power-station.png" alt="Power Station" className="h-full w-full object-contain p-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="relative bg-white py-32">
        <div className="mx-auto max-w-5xl px-8">
          <p className="text-xs font-medium uppercase tracking-[.25em] text-gray-400 mb-4">Kategori</p>
          <h2 className="text-3xl font-light tracking-tight lg:text-4xl">Temukan yang Anda butuhkan</h2>
          <div className="mt-16 grid gap-0 divide-y divide-gray-100">
            {CATEGORIES.map((cat,i) => (
              <Link key={cat.s} href={`/kategori/${cat.s}`} className="group flex cursor-pointer items-center justify-between py-8 transition hover:bg-gray-50/50 -mx-4 px-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-200 mr-3 font-mono">0{i+1}</span>
                  <h3 className="inline text-xl font-medium">{cat.n}</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-xl">{cat.d}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-2xl text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-50/60 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-white h-96 shadow-xl shadow-gray-900/5 ring-1 ring-gray-900/5">
              <img src="/images/prototype/solar-panel-open.png" alt="Panel Surya" className="h-full w-full object-contain p-8" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[.25em] text-gray-400">Produk Unggulan</p>
              <h2 className="mt-4 text-3xl font-light tracking-tight">Panel Surya 275W Mono</h2>
              <p className="mt-6 text-gray-500 leading-relaxed">Modul monocrystalline premium buatan Jepang. Efisiensi tinggi, garansi 5 tahun. Cocok untuk instalasi residensial dan komersial skala menengah.</p>
              <div className="mt-8 flex items-baseline gap-4">
                <span className="text-3xl font-light">Rp 1.450.000</span>
                <span className="text-sm text-gray-400 line-through">Rp 2.250.000</span>
              </div>
              <div className="mt-8 flex gap-3">
                <Link href="/produk/panel-surya-mitsubishi-mje275fb-275wp" className="rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10 transition">Beli Sekarang</Link>
                <Link href="/produk/panel-surya-mitsubishi-mje275fb-275wp" className="rounded-full px-8 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition">Detail →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BRANDS ===== */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-5xl px-8">
          <p className="text-xs font-medium uppercase tracking-[.25em] text-gray-400 mb-8 text-center">Brand Resmi</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-30">
            {BRANDS.map(b => (
              <span key={b} className="text-sm font-bold tracking-wider text-gray-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl px-8 py-32 text-center">
          <h2 className="text-3xl font-light tracking-tight text-white lg:text-4xl">Butuh bantuan memilih?</h2>
          <p className="mt-6 text-lg text-gray-400">Tim kami siap membantu Anda menemukan produk yang tepat untuk kebutuhan energi Anda.</p>
          <Link href="/permintaan-penawaran" className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-sm font-medium text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/5 transition">Konsultasi Gratis</Link>
        </div>
      </section>
    </>
  );
}

const IMG = {
  hero: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=1200&q=80',
  panel: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',
  farm: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&q=80',
  battery: 'https://images.unsplash.com/photo-1629654297299-c8506223fa1f?w=500&q=80',
  install: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
};

export default function ConceptB() {
  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-light tracking-widest text-gray-800">EBT<span className="font-bold text-emerald-600">PLAZA</span></span>
          <div className="hidden items-center gap-10 md:flex">
            {['Katalog','Solusi','Proyek','Tentang'].map(l => (
              <a key={l} href="#" className="text-sm tracking-wide text-gray-500 hover:text-gray-900 transition">{l}</a>
            ))}
            <a href="#" className="rounded-full border-2 border-gray-900 px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-900 hover:text-white transition-all">Kontak</a>
          </div>
        </div>
      </nav>

      {/* Hero — Split layout */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.3em] text-emerald-600">Renewable Energy Marketplace</p>
          <h1 className="text-4xl font-light leading-tight text-gray-900 md:text-5xl lg:text-6xl">
            Tenaga Surya<br />
            <span className="font-bold">untuk Semua</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-500">Produk energi terbarukan berkualitas premium — dikurasi untuk performa, garansi, dan harga terbaik.</p>
          <div className="mt-8 flex gap-4">
            <a href="#" className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition">Jelajahi Katalog</a>
            <a href="#" className="rounded-full border-2 border-gray-200 px-8 py-3.5 text-sm font-semibold text-gray-600 hover:border-gray-400 transition">Lihat Proyek</a>
          </div>
        </div>
        <div className="relative">
          <img src={IMG.hero} alt="" className="rounded-3xl shadow-2xl" />
          <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-xl">
            <p className="text-xs text-gray-400">Kapasitas Terpasang</p>
            <p className="text-2xl font-bold">50+ MW</p>
          </div>
        </div>
      </section>

      {/* Categories — Minimal cards */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[.3em] text-emerald-600 mb-2">Kategori</p>
          <h2 className="text-center text-3xl font-light mb-4">Temukan yang Anda Butuhkan</h2>
          <p className="text-center text-gray-400 mb-12">Semua produk energi surya dalam satu platform</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { n:'Panel Surya', s:'12 Produk' },
              { n:'Inverter', s:'8 Produk' },
              { n:'Baterai', s:'15 Produk' },
              { n:'Charge Controller', s:'6 Produk' },
              { n:'Paket PLTS', s:'9 Produk' },
              { n:'Mounting', s:'5 Produk' },
              { n:'Kabel & Proteksi', s:'10 Produk' },
              { n:'Pompa Air', s:'4 Produk' },
            ].map(c => (
              <div key={c.n} className="group cursor-pointer rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md">
                <div className="mx-auto mb-4 h-2 w-8 rounded-full bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-400 transition-all" />
                <h3 className="font-semibold text-gray-900">{c.n}</h3>
                <p className="mt-1 text-sm text-gray-400">{c.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase — Large image cards */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { img:IMG.panel, t:'Panel Surya Premium', d:'Efisiensi tinggi, garansi 25 tahun.' },
              { img:IMG.battery, t:'Penyimpanan Energi', d:'Baterai lithium untuk rumah dan bisnis.' },
              { img:IMG.farm, t:'Solusi Skala Besar', d:'Sistem untuk industri dan utilitas.' },
            ].map(c => (
              <div key={c.t} className="group cursor-pointer">
                <div className="overflow-hidden rounded-2xl">
                  <img src={c.img} alt="" className="h-64 w-full object-cover transition group-hover:scale-105" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{c.t}</h3>
                <p className="mt-2 text-sm text-gray-500">{c.d}</p>
                <a href="#" className="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:underline">Selengkapnya →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="border-y border-gray-100 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[.3em] text-gray-400 mb-8">Brand Resmi</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-30">
            {['MITSUBISHI ELECTRIC','CANADIAN SOLAR','LONGi','BLUETTI','BEZVOLT','AIKO','GH SOLAR','SRNE','REKASURYA'].map(b => (
              <span key={b} className="text-lg font-bold tracking-wider">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={IMG.install} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/80" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-3xl font-light text-white">Butuh Solusi Khusus?</h2>
          <p className="mt-4 text-gray-300">Tim kami siap membantu merancang sistem tenaga surya untuk kebutuhan spesifik Anda.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition">Konsultasi Gratis</a>
            <a href="#" className="rounded-full border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:border-white/60 transition">Lihat Portofolio</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-sm text-gray-400">© 2026 EBTPlaza</span>
            <div className="flex gap-6 text-sm text-gray-500">{['Privasi','Syarat','Kontak','FAQ'].map(l => <a key={l} href="#" className="hover:text-gray-900 transition">{l}</a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

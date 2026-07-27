const IMG = {
  hero: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1400&q=80',
  roof: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80',
  panels: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
  farm: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80',
  battery: 'https://images.unsplash.com/photo-1629654297299-c8506223fa1f?w=600&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
};

export default function ConceptC() {
  return (
    <div className="font-sans text-gray-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <span className="text-xl font-bold text-gray-900">EBT<span className="text-teal-600">Plaza</span></span>
            <div className="hidden gap-8 lg:flex">
              {['Produk','Solusi','Proyek','Tentang Kami','Blog'].map(l => (
                <a key={l} href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition">Masuk</a>
            <a href="#" className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">Daftar</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" /> Tersedia 200+ Produk
            </div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl lg:leading-tight">
              Solusi Energi Terbarukan untuk{' '}
              <span className="text-teal-400">Bisnis Modern</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              Platform B2B untuk pengadaan panel surya, inverter, baterai, dan sistem PLTS lengkap — dengan garansi resmi dan pengiriman nasional.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#" className="rounded-lg bg-teal-500 px-8 py-4 text-center font-semibold text-white hover:bg-teal-400 transition">Jelajahi Produk</a>
              <a href="#" className="rounded-lg border border-slate-600 px-8 py-4 text-center font-semibold text-slate-300 hover:border-slate-400 hover:text-white transition">Minta Penawaran</a>
            </div>
            <div className="mt-10 flex gap-8 text-sm">
              {[
                { v:'200+', l:'Produk' },
                { v:'10+', l:'Brand Resmi' },
                { v:'500+', l:'Klien Bisnis' },
              ].map(s => (
                <div key={s.l}>
                  <p className="text-2xl font-bold text-teal-400">{s.v}</p>
                  <p className="text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src={IMG.hero} alt="" className="rounded-2xl shadow-2xl shadow-teal-900/50" />
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-4 shadow-xl text-gray-900">
              <p className="text-xs text-gray-400">Rating Pelanggan</p>
              <p className="text-lg font-bold">★★★★★ <span className="text-teal-600">4.9</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-white py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[.2em] text-gray-400">Dipercaya oleh Perusahaan Terkemuka</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-30 grayscale">
            {['MITSUBISHI ELECTRIC','CANADIAN SOLAR','LONGi Solar','BLUETTI','BEZVOLT','AIKO','GH SOLAR','SRNE','REKASURYA','SANKELUX'].map(b => (
              <span key={b} className="text-sm font-bold tracking-wider text-gray-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-teal-600">Kategori</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 lg:text-4xl">Produk Energi Surya Lengkap</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Dari panel surya hingga sistem penyimpanan — semua yang dibutuhkan untuk proyek energi terbarukan Anda.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial — berbagai rating daya', u:'12 Produk', img:IMG.panels },
              { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid — single & three phase', u:'8 Produk', img:IMG.roof },
              { n:'Baterai', d:'Lithium LiFePO4, Rack, Wall Mounted, All-in-One ESS', u:'15 Produk', img:IMG.battery },
              { n:'Paket PLTS', d:'Paket lengkap untuk rumah, kantor, dan industri', u:'9 Produk', img:IMG.farm },
            ].map(c => (
              <div key={c.n} className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-xl hover:border-teal-200">
                <div className="h-40 overflow-hidden">
                  <img src={c.img} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{c.n}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{c.d}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-teal-600">{c.u}</span>
                    <span className="rounded-full bg-gray-100 p-2 text-xs transition group-hover:bg-teal-100 group-hover:text-teal-600">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.2em] text-teal-600">Keunggulan</p>
              <h2 className="mt-3 text-3xl font-bold lg:text-4xl">Mengapa Memilih EBTPlaza?</h2>
              <p className="mt-4 text-gray-500 leading-relaxed">Kami memahami bahwa proyek energi membutuhkan keandalan, kualitas, dan dukungan teknis yang konsisten.</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {[
                  { t:'Garansi Resmi', d:'Semua produk bergaransi distributor resmi', i:'🛡️' },
                  { t:'Pengiriman Cepat', d:'Jangkauan nasional dengan asuransi', i:'🚚' },
                  { t:'Harga Kompetitif', d:'Harga grosir untuk pembelian proyek', i:'💰' },
                  { t:'Dukungan Teknis', d:'Konsultasi & after-sales support', i:'🔧' },
                ].map(w => (
                  <div key={w.t} className="flex gap-3">
                    <span className="text-2xl shrink-0">{w.i}</span>
                    <div>
                      <h3 className="font-semibold">{w.t}</h3>
                      <p className="mt-1 text-sm text-gray-500">{w.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <img src={IMG.office} alt="" className="rounded-2xl shadow-xl" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-teal-700">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">Siap Memulai Proyek Energi Anda?</h2>
          <p className="mt-4 text-lg text-teal-100">Hubungi tim kami untuk konsultasi gratis dan penawaran khusus.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded-lg bg-white px-8 py-4 font-semibold text-teal-700 hover:bg-teal-50 transition">Hubungi Kami</a>
            <a href="#" className="rounded-lg border-2 border-teal-400 px-8 py-4 font-semibold text-white hover:bg-teal-600 transition">Lihat Katalog</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-slate-400">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-5">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-white">EBTPlaza</h3>
              <p className="mt-3 text-sm leading-relaxed">Platform B2B energi terbarukan — menyediakan produk tenaga surya berkualitas untuk kontraktor, developer, dan bisnis di Indonesia.</p>
            </div>
            {[
              { t:'Produk', l:['Panel Surya','Inverter','Baterai','Paket PLTS','Aksesoris'] },
              { t:'Perusahaan', l:['Tentang Kami','Karir','Blog','Media','Kontak'] },
              { t:'Bantuan', l:['FAQ','Pengiriman','Garansi','Syarat & Ketentuan','Privasi'] },
            ].map(c => (
              <div key={c.t}>
                <h3 className="font-semibold text-white">{c.t}</h3>
                <ul className="mt-4 space-y-2 text-sm">{c.l.map(l => <li key={l}><a href="#" className="hover:text-teal-400 transition">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">© 2026 EBTPlaza. Hak cipta dilindungi.</div>
        </div>
      </footer>
    </div>
  );
}

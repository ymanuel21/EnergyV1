const IMG = {
  hero: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80',
  rooftop: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80',
  farm: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80',
  install: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  battery: 'https://images.unsplash.com/photo-1629654297299-c8506223fa1f?w=400&q=80',
};

export default function ConceptA() {
  return (
    <div className="font-sans text-gray-900">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-2xl font-black tracking-tight">
            EBT<span className="text-blue-600">Plaza</span>
          </span>
          <div className="hidden items-center gap-8 md:flex">
            {['Produk','Solusi','Proyek','Blog','Kontak'].map(l => (
              <a key={l} href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">{l}</a>
            ))}
          </div>
          <a href="#" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">Hubungi Kami</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 h-[600px] md:h-[700px] overflow-hidden">
          <img src={IMG.hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/70 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-40">
          <div className="max-w-2xl">
            <div className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-semibold text-blue-200 backdrop-blur">
              Platform Energi Terbarukan #1 di Indonesia
            </div>
            <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-6xl md:leading-tight">
              Energi Masa Depan,<br />Hadir Hari Ini
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-blue-200">
              Ribuan produk tenaga surya berkualitas — dari panel, inverter, baterai, hingga paket instalasi lengkap untuk rumah dan bisnis Anda.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="#" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 font-bold text-blue-900 hover:bg-blue-50 transition">Jelajahi Katalog</a>
              <a href="#" className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-4 font-bold text-white hover:border-white/60 transition backdrop-blur">Konsultasi Gratis</a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 md:text-4xl">Kategori Produk</h2>
            <p className="mt-3 text-gray-500">Semua yang Anda butuhkan untuk sistem tenaga surya</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial', i:'☀️' },
              { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro', i:'⚡' },
              { n:'Baterai', d:'Lithium, Rack Mounted, Wall, ESS', i:'🔋' },
              { n:'Charge Controller', d:'MPPT dan PWM', i:'🎛️' },
              { n:'Paket PLTS', d:'Rumah, Kantor, Industri', i:'🏠' },
              { n:'Mounting', d:'Atap, Ground, Carport', i:'🔩' },
              { n:'Kabel & Proteksi', d:'PV Cable, MC4, MCB, SPD', i:'🔌' },
              { n:'Pompa Air', d:'Submersible & Surface', i:'💧' },
            ].map(c => (
              <div key={c.n} className="group cursor-pointer rounded-2xl border-2 border-gray-100 bg-gray-50 p-6 transition hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
                <span className="text-3xl">{c.i}</span>
                <h3 className="mt-4 text-lg font-bold">{c.n}</h3>
                <p className="mt-1 text-sm text-gray-500">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black">Produk Unggulan</h2>
              <p className="mt-2 text-gray-500">Pilihan terbaik minggu ini</p>
            </div>
            <a href="#" className="hidden sm:block text-sm font-bold text-blue-600 hover:underline">Lihat Semua →</a>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="group cursor-pointer rounded-2xl bg-white shadow-sm transition hover:shadow-xl overflow-hidden">
                <img src={[IMG.rooftop, IMG.farm, IMG.install, IMG.battery][i-1]} alt="" className="h-48 w-full object-cover" />
                <div className="p-5">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{['NEW','BEST SELLER','PROMO','CLEARANCE'][i-1]}</span>
                  <h3 className="mt-3 font-bold leading-snug">{['Panel Surya 550W Mono','Inverter Hybrid 6kW','Baterai Lithium 5.12kWh','Power Station 504Wh'][i-1]}</h3>
                  <p className="mt-2 text-xl font-black text-blue-600">{['Rp 1.550.000','Rp 15.900.000','Rp 16.900.000','Rp 6.590.000'][i-1]}</p>
                  <button className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition">+ Keranjang</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-black mb-12">Mengapa EBTPlaza?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { t:'Garansi Resmi', d:'Semua produk bergaransi resmi dari distributor authorized.', i:'🛡️' },
              { t:'Pengiriman Nasional', d:'Kirim ke seluruh Indonesia dengan asuransi pengiriman.', i:'🚚' },
              { t:'Harga Kompetitif', d:'Harga terbaik untuk grosir dan proyek skala besar.', i:'💎' },
              { t:'Tim Ahli', d:'Konsultasi teknis gratis untuk desain sistem Anda.', i:'🎓' },
              { t:'After-Sales', d:'Dukungan teknis pasca pembelian dan pemasangan.', i:'🔧' },
              { t:'Bayar Fleksibel', d:'Transfer bank, VA, cicilan bisnis tersedia.', i:'💳' },
            ].map(w => (
              <div key={w.t} className="flex gap-4">
                <span className="text-3xl shrink-0">{w.i}</span>
                <div>
                  <h3 className="font-bold text-lg">{w.t}</h3>
                  <p className="mt-1 text-sm text-gray-500">{w.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-blue-900 py-20">
        <img src={IMG.farm} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-black text-white md:text-4xl">Siap Beralih ke Energi Surya?</h2>
          <p className="mt-4 text-lg text-blue-200">Dapatkan konsultasi gratis dan penawaran terbaik untuk proyek Anda.</p>
          <a href="#" className="mt-8 inline-block rounded-lg bg-white px-10 py-4 font-bold text-blue-900 hover:bg-blue-50 transition text-lg">Mulai Sekarang</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-black text-white">EBTPlaza</h3>
              <p className="mt-3 text-sm">Platform energi terbarukan terpercaya di Indonesia.</p>
            </div>
            {[
              { t:'Produk', l:['Panel Surya','Inverter','Baterai','Paket PLTS'] },
              { t:'Perusahaan', l:['Tentang','Blog','Karir','Kontak'] },
              { t:'Bantuan', l:['FAQ','Pengiriman','Garansi','Syarat'] },
            ].map(c => (
              <div key={c.t}><h3 className="font-bold text-white mb-3">{c.t}</h3><ul className="space-y-2 text-sm">{c.l.map(l => <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">© 2026 EBTPlaza. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default function PrototypeAPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold text-gray-900">EBT<span className="text-emerald-600">Plaza</span></span>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm text-gray-600 hover:text-emerald-700">Produk</a>
            <a href="#" className="text-sm text-gray-600 hover:text-emerald-700">Solusi</a>
            <a href="#" className="text-sm text-gray-600 hover:text-emerald-700">Proyek</a>
            <a href="#" className="text-sm text-gray-600 hover:text-emerald-700">Tentang</a>
            <a href="#" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Hubungi Kami</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400">Solusi Energi Terbarukan</p>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-6xl">Energi Cerdas untuk Bisnis Masa Depan</h1>
          <p className="mb-8 text-lg text-slate-300">Produk tenaga surya berkualitas untuk kontraktor, developer, dan perusahaan di seluruh Indonesia.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded-lg bg-emerald-500 px-8 py-3 font-semibold text-white hover:bg-emerald-600 transition">Jelajahi Katalog</a>
            <a href="#" className="rounded-lg border border-slate-500 px-8 py-3 font-semibold text-white hover:border-white transition">Ajukan Penawaran</a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="mb-4 text-sm font-medium text-gray-500">DIPERCAYA OLEH 500+ KONTRAKTOR & PERUSAHAAN</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['MITSUBISHI ELECTRIC','CANADIAN SOLAR','LONGi Solar','BLUETTI','BEZVOLT','AIKO','GH SOLAR','SRNE'].map(b => (
              <span key={b} className="text-sm font-bold text-gray-400">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">Kategori Produk</h2>
          <p className="mb-12 text-center text-gray-500">Temukan solusi energi yang tepat untuk proyek Anda</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name:'Panel Surya', count: 12, icon:'☀️' },
              { name:'Inverter', count: 8, icon:'⚡' },
              { name:'Baterai', count: 15, icon:'🔋' },
              { name:'Solar Charge Controller', count: 6, icon:'🎛️' },
              { name:'Paket PLTS', count: 9, icon:'🏠' },
              { name:'Mounting & Rangka', count: 5, icon:'🔩' },
              { name:'Kabel & Proteksi', count: 10, icon:'🔌' },
              { name:'Pompa Air', count: 4, icon:'💧' },
            ].map(c => (
              <div key={c.name} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-lg">
                <span className="text-3xl">{c.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{c.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{c.count} produk</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why EBTPlaza */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Mengapa EBTPlaza?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title:'Garansi Resmi', desc:'Semua produk bergaransi resmi dari distributor authorized.', icon:'✅' },
              { title:'Pengiriman Nasional', desc:'Kirim ke seluruh Indonesia dengan asuransi pengiriman.', icon:'🚚' },
              { title:'Harga Kompetitif', desc:'Harga terbaik untuk pembelian grosir dan proyek besar.', icon:'💰' },
              { title:'Tim Ahli', desc:'Konsultasi teknis gratis untuk desain sistem Anda.', icon:'👨‍🔧' },
              { title:'After-Sales Support', desc:'Dukungan teknis pasca pembelian dan instalasi.', icon:'🛠️' },
              { title:'Pembayaran Fleksibel', desc:'Transfer bank, virtual account, dan cicilan bisnis.', icon:'💳' },
            ].map(w => (
              <div key={w.title} className="rounded-xl border bg-white p-6">
                <span className="text-2xl">{w.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{w.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Siap Memulai Proyek Energi Anda?</h2>
          <p className="mb-8 text-emerald-100">Tim kami siap membantu dari konsultasi, pemilihan produk, hingga pengiriman.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded-lg bg-white px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 transition">Konsultasi Gratis</a>
            <a href="#" className="rounded-lg border border-emerald-300 px-8 py-3 font-semibold text-white hover:bg-emerald-600 transition">Lihat Produk</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">EBTPlaza</h3>
              <p className="text-sm">Pusat produk energi terbarukan untuk bisnis dan proyek di Indonesia.</p>
            </div>
            {[
              { title:'Produk', links:['Panel Surya','Inverter','Baterai','Paket PLTS'] },
              { title:'Perusahaan', links:['Tentang Kami','Karir','Blog','Kontak'] },
              { title:'Bantuan', links:['FAQ','Pengiriman','Garansi','Kebijakan'] },
            ].map(col => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h3>
                <ul className="space-y-2 text-sm">{col.links.map(l => <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">© 2026 EBTPlaza. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

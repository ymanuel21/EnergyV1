const IMG = {
  hero: '/images/prototype/hero-pro.jpg',
  panel: '/images/prototype/solar-panel-open.png',
  wall: '/images/prototype/battery-wall.png',
  charger: '/images/prototype/charger-dc.png',
};

export default function PrototypeC() {
  return (
    <div className="font-sans text-gray-700">
      {/* ===== MEGA NAV ===== */}
      <nav className="sticky top-0 z-50 border-b-2 border-teal-700 bg-white">
        <div className="bg-teal-900 text-white text-xs">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
            <span>📞 (022) 2052-2279 • ✉️ info@ebtplaza.com</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-teal-200">Customer Portal</a>
              <a href="#" className="hover:text-teal-200">Track Order</a>
              <a href="#" className="hover:text-teal-200">EN 🇬🇧</a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-10">
            <span className="text-xl font-bold text-teal-900">EBTPlaza</span>
            <div className="hidden gap-1 lg:flex">
              {[
                { n:'Produk', s:true },
                { n:'Solusi', s:false },
                { n:'Proyek', s:false },
                { n:'Layanan', s:false },
                { n:'Resources', s:false },
                { n:'Tentang Kami', s:false },
              ].map(l => (
                <a key={l.n} href="#" className={`px-3 py-2 text-sm font-medium rounded transition ${l.s ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:text-teal-700'}`}>{l.n}{l.s && ' ▾'}</a>
              ))}
            </div>
          </div>
          <a href="#" className="rounded bg-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition">Hubungi Kami</a>
        </div>
      </nav>

      {/* ===== HERO — Stats-driven ===== */}
      <section className="relative bg-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(30deg, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-3 inline-block rounded border border-teal-400/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300">B2B Energy Solutions</div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl lg:leading-tight">
              Pengadaan Energi Terbarukan untuk{' '}
              <span className="text-teal-300">Skala Enterprise</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-teal-200/80 max-w-2xl">
              Mitra terpercaya untuk kontraktor, pengembang properti, dan perusahaan dalam pengadaan panel surya, inverter, dan sistem penyimpanan energi.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#" className="rounded bg-white px-8 py-4 text-center font-bold text-teal-900 hover:bg-teal-50 transition">Minta Penawaran</a>
              <a href="#" className="rounded border-2 border-teal-500 px-8 py-4 text-center font-bold text-white hover:bg-teal-700 transition">Download Company Profile</a>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid gap-8 border-t border-teal-700 pt-12 sm:grid-cols-4">
            {[
              { v:'200+', l:'Produk Tersedia' },
              { v:'500+', l:'Proyek Selesai' },
              { v:'34', l:'Provinsi Terjangkau' },
              { v:'10+', l:'Brand Resmi' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-3xl font-bold text-teal-300">{s.v}</div>
                <div className="mt-1 text-sm text-teal-200/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTIONS — Card grid with icons ===== */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-500">Solusi</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Produk untuk Setiap Kebutuhan</h2>
            <p className="mt-4 text-gray-500 max-w-2xl">Dari instalasi skala kecil hingga proyek infrastruktur besar — kami menyediakan solusi lengkap.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial. Efisiensi hingga 22%.', u:'Lihat Produk →', img:IMG.panel },
              { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid. Single & three phase. Garansi 5 tahun.', u:'Lihat Produk →', img:IMG.charger },
              { n:'Baterai', d:'LiFePO4. Rack, Wall Mounted, ESS. 6000+ siklus.', u:'Lihat Produk →', img:IMG.wall },
              { n:'Paket PLTS', d:'Rumah, Kantor, Industri. Sistem turnkey dengan instalasi.', u:'Lihat Produk →', img:IMG.hero },
            ].map(c => (
              <div key={c.n} className="overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-lg">
                <div className="h-44 bg-gray-100 overflow-hidden">
                  <img src={c.img} alt="" className="h-full w-full object-contain p-6" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900">{c.n}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{c.d}</p>
                  <a href="#" className="mt-4 inline-block text-sm font-bold text-teal-600 hover:text-teal-900">{c.u}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY US — Alternating rows ===== */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-500">Keunggulan</p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Mengapa Perusahaan Memilih Kami</h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              { t:'Garansi & Sertifikasi', d:'Semua produk bergaransi resmi dengan sertifikat keaslian. Didukung distributor authorized.', i:'📜' },
              { t:'Logistik Nasional', d:'Jaringan pengiriman ke 34 provinsi dengan asuransi penuh. Tracking real-time.', i:'🚛' },
              { t:'Harga Proyek', d:'Pricing khusus untuk pembelian volume besar. Transparan, tanpa biaya tersembunyi.', i:'📊' },
              { t:'Dukungan Teknis', d:'Tim engineer siap membantu desain sistem, kalkulasi beban, dan spesifikasi teknis.', i:'🔧' },
              { t:'After-Sales', d:'Garansi klaim mudah, dukungan pasca instalasi, dan program pemeliharaan.', i:'🤝' },
              { t:'Pembayaran Bisnis', d:'Invoice 30 hari, transfer bank, dan fasilitas kredit untuk pelanggan korporat.', i:'🏦' },
            ].map(w => (
              <div key={w.t} className="flex gap-4 rounded-lg border border-gray-100 p-6 transition hover:border-teal-200">
                <span className="text-2xl shrink-0">{w.i}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{w.t}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{w.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLIENTS ===== */}
      <section className="border-y border-gray-200 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gray-400">Dipercaya Oleh</p>
          <div className="mt-8 grid grid-cols-3 gap-8 opacity-40 sm:grid-cols-5 lg:grid-cols-10">
            {['MITSUBISHI\nELECTRIC','CANADIAN\nSOLAR','LONGi','BLUETTI','BEZVOLT','AIKO','GH SOLAR','SRNE','REKASURYA','SANKELUX'].map(b => (
              <div key={b} className="flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400 whitespace-pre-line text-center">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-teal-900 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center text-white">
          <h2 className="text-3xl font-bold lg:text-4xl">Mulai Proyek Anda Hari Ini</h2>
          <p className="mt-4 text-lg text-teal-200">Kirimkan spesifikasi kebutuhan dan tim kami akan memberikan penawaran dalam 24 jam.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded bg-white px-8 py-4 font-bold text-teal-900 hover:bg-teal-50 transition">Ajukan Permintaan</a>
            <a href="#" className="rounded border-2 border-teal-500 px-8 py-4 font-bold text-white hover:bg-teal-700 transition">Jadwalkan Demo</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-bold text-white">EBTPlaza</h3>
              <p className="mt-4 text-sm leading-relaxed">Solusi pengadaan energi terbarukan untuk bisnis dan industri di Indonesia.</p>
              <p className="mt-4 text-sm">📞 (022) 2052-2279</p>
              <p className="text-sm">✉️ info@ebtplaza.com</p>
            </div>
            {[
              ['Produk','Panel Surya','Inverter','Baterai','Paket PLTS','Aksesoris'],
              ['Perusahaan','Tentang Kami','Karir','Blog','Media','Kontak'],
              ['Support','Technical Support','Garansi','Pengiriman','FAQ','Dokumentasi'],
            ].map((col,i) => (
              <div key={i}><h3 className="font-bold text-white mb-4">{col[0]}</h3><ul className="space-y-2 text-sm">{col.slice(1).map(l => <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col gap-4 sm:flex-row sm:justify-between text-sm">
            <span>© 2026 EBTPlaza. All rights reserved.</span>
            <div className="flex gap-6">{['Privacy Policy','Terms of Service','Sitemap'].map(l => <a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

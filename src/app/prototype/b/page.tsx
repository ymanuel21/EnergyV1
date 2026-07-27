export default function PrototypeBPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <span className="text-lg font-bold text-orange-600">EBTPlaza</span>
          <div className="hidden flex-1 sm:block">
            <div className="relative mx-auto max-w-lg">
              <input type="text" placeholder="Cari panel surya, inverter, baterai..." className="w-full rounded-full border-2 border-orange-200 bg-orange-50 py-2 pl-4 pr-10 text-sm focus:border-orange-400 focus:outline-none" />
              <span className="absolute right-3 top-2 text-orange-400">🔍</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="cursor-pointer rounded-full bg-orange-100 px-3 py-1 text-orange-700">⚖ Bandingkan (2)</span>
            <span className="cursor-pointer">🛒</span>
          </div>
        </div>
      </nav>

      {/* Category quick nav */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-xs font-medium">
          {['Panel Surya','Inverter','Baterai','Solar Charger','Paket PLTS','Mounting','Kabel','Pompa Air','Aksesoris'].map(c => (
            <span key={c} className="cursor-pointer whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition">{c}</span>
          ))}
        </div>
      </div>

      {/* Flash Deals */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">⚡ Flash Sale</h2>
              <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-600">Berakhir 2j 15m</span>
            </div>
            <a href="#" className="text-sm font-medium text-orange-600 hover:underline">Lihat Semua →</a>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border bg-white p-4 transition hover:shadow-md">
                <div className="mb-3 h-40 rounded-lg bg-gray-200 animate-pulse" />
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">CLEARANCE</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">Panel Surya 550W Monocrystalline</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-orange-600">Rp 1.250.000</span>
                  <span className="text-xs text-gray-400 line-through">Rp 2.100.000</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Kategori</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[{n:'Panel\nSurya',c:'☀️'},{n:'Inverter',c:'⚡'},{n:'Baterai',c:'🔋'},{n:'Charge\nController',c:'🎛️'},{n:'Paket\nPLTS',c:'🏠'},{n:'Mounting',c:'🔩'},{n:'Kabel &\nProteksi',c:'🔌'},{n:'Pompa\nAir',c:'💧'}].map(cat => (
              <div key={cat.c} className="cursor-pointer rounded-xl bg-white p-4 text-center shadow-sm transition hover:shadow-md">
                <span className="text-2xl">{cat.c}</span>
                <p className="mt-2 text-xs font-medium text-gray-700 whitespace-pre-line">{cat.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Produk Terlaris</h2>
            <div className="flex gap-2 text-sm">
              {['Panel Surya','Inverter','Baterai'].map(t => (
                <span key={t} className="cursor-pointer rounded-full border px-3 py-1 text-gray-600 hover:border-orange-300 hover:text-orange-600">{t}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="group cursor-pointer rounded-xl border bg-white p-3 transition hover:shadow-lg">
                <div className="mb-3 h-36 rounded-lg bg-gray-200 animate-pulse" />
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">NEW</span>
                <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2">Inverter Hybrid 6000W Single Phase</h3>
                <p className="mt-1 text-lg font-bold text-gray-900">Rp 15.900.000</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">★★★★★ <span className="text-gray-400">(24)</span></div>
                <button className="mt-3 w-full rounded-lg border border-orange-300 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50">+ Keranjang</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white">Bingung memilih? Bandingkan produk</h2>
          <p className="mb-6 text-amber-100">Lihat spesifikasi berdampingan dan temukan produk terbaik untuk kebutuhan Anda.</p>
          <a href="#" className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-orange-600 hover:bg-orange-50 transition">Mulai Bandingkan →</a>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-900">Brand Resmi</h2>
          <div className="grid grid-cols-4 gap-6 opacity-40 sm:grid-cols-5">
            {['Mitsubishi\nElectric','Canadian\nSolar','LONGi','BLUETTI','BEZVOLT','AIKO','GH Solar','SRNE','Rekasurya','Sankelux'].map(b => (
              <div key={b} className="flex items-center justify-center rounded-xl border bg-gray-50 p-4 text-center text-xs font-bold text-gray-400 whitespace-pre-line">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-3 font-bold text-orange-600">EBTPlaza</h3>
              <p className="text-sm text-gray-500">Marketplace energi terbarukan #1 di Indonesia.</p>
            </div>
            {[
              { t:'Kategori', l:['Panel Surya','Inverter','Baterai','Paket PLTS','Aksesoris'] },
              { t:'Layanan', l:['Bandingkan','Permintaan Penawaran','Konsultasi','Pengiriman'] },
              { t:'Bantuan', l:['FAQ','Syarat & Ketentuan','Kebijakan Privasi','Kontak'] },
            ].map(c => (
              <div key={c.t}>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">{c.t}</h3>
                <ul className="space-y-1 text-sm text-gray-500">{c.l.map(l => <li key={l}><a href="#" className="hover:text-orange-600 transition">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">© 2026 EBTPlaza</div>
        </div>
      </footer>
    </div>
  );
}

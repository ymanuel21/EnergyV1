export default function ConceptCurrent() {
  return (
    <div className="font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-xl font-bold">EBT<span className="text-brand-700">Plaza</span></span>
          <div className="hidden items-center gap-6 lg:flex">
            <span className="rounded-lg border px-4 py-2 text-sm font-medium">☰ Semua Kategori</span>
            <input placeholder="Cari produk..." className="rounded-lg border px-4 py-2 text-sm w-64" />
          </div>
          <div className="flex items-center gap-3">{['⚖','❤️','🛒'].map(i => <span key={i} className="text-lg">{i}</span>)}</div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[350px] bg-gradient-to-r from-blue-600 to-blue-800 flex items-center">
        <div className="mx-auto max-w-7xl px-4 text-center text-white">
          <h1 className="text-3xl font-bold md:text-5xl">Energi Cerdas, Tinggal Klik!</h1>
          <p className="mt-4 text-blue-100">Produk energi terbarukan untuk rumah & bisnis Anda</p>
          <a href="#" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-700">Lihat Produk</a>
        </div>
      </section>

      {/* Need Cards */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold mb-8">Mulai dari kebutuhan Anda</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { t:'Beli Produk', d:'Belanja langsung dari katalog', cta:'Lihat Katalog', i:'🛒' },
              { t:'Pasang PLTS', d:'Solusi tenaga surya lengkap', cta:'Pilih Paket', i:'☀️' },
              { t:'Kebutuhan Proyek', d:'Untuk kontraktor & pengadaan', cta:'Minta Penawaran', i:'📋' },
            ].map(c => (
              <div key={c.t} className="rounded-2xl border p-6 transition hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{c.i}</div>
                <h3 className="text-lg font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-gray-500">{c.d}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">{c.cta} →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Sections */}
      <section className="py-10 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-bold mb-1">CLEARANCE</h2>
          <p className="text-sm text-gray-500 mb-6">Stok terbatas • Termurah!</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-xl border bg-white p-3">
                <div className="h-36 rounded-lg bg-gray-200 animate-pulse mb-3" />
                <h3 className="text-sm font-semibold line-clamp-2">Panel Surya {['Mitsubishi 275W','Canadian 440W','Bekas 100W','LONGi 540W','Baterai 60Ah'][i-1]}</h3>
                <p className="mt-1 text-lg font-bold">{['Rp 1.450.000','Rp 1.800.000','Rp 170.000','Rp 1.550.000','Rp 1.650.000'][i-1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-bold mb-1">PROMO & PENAWARAN</h2>
          <p className="text-sm text-gray-500 mb-6">Harga spesial • Hemat lebih banyak!</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl border bg-white p-3">
                <div className="h-36 rounded-lg bg-gray-200 animate-pulse mb-3" />
                <h3 className="text-sm font-semibold line-clamp-2">{['BEZVOLT 5.12kWh','Hybrid Inverter 6kW','BLUETTI AC50P','Power Station'][i-1]}</h3>
                <p className="mt-1 text-lg font-bold">{['Rp 16.900.000','Rp 15.900.000','Rp 6.590.000','Rp 5.000.000'][i-1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div><h3 className="font-bold">EBTPlaza</h3><p className="text-sm text-gray-500 mt-2">Pusat produk energi terbarukan.</p></div>
            {[
              { t:'Layanan', l:['Bandingkan','Permintaan Penawaran','Cek Ongkir','Afiliasi'] },
              { t:'Informasi', l:['Tentang Kami','Blog','Karir','Kontak'] },
              { t:'Bantuan', l:['FAQ','Pengiriman','Garansi','Kebijakan'] },
            ].map(c => (
              <div key={c.t}><h3 className="font-semibold mb-3">{c.t}</h3><ul className="space-y-1 text-sm text-gray-500">{c.l.map(l => <li key={l}><a href="#" className="hover:text-brand-700 transition">{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-gray-400">© 2026 EBTPlaza. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

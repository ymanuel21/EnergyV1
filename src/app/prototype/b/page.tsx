const IMG = {
  panel: '/images/prototype/solar-panel-open.png',
  battery: '/images/prototype/battery-large.png',
  hero: '/images/prototype/hero-power-station.png',
};

export default function PrototypeB() {
  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* ===== MINIMAL NAV ===== */}
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-8">
          <span className="text-lg font-semibold tracking-tight">EBTPlaza</span>
          <div className="hidden items-center gap-8 sm:flex">
            {['Katalog','Tentang','Kontak'].map(l => (
              <a key={l} href="#" className="text-sm text-gray-500 hover:text-gray-900 transition">{l}</a>
            ))}
            <a href="#" className="rounded-full bg-gray-900 px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition">Mulai</a>
          </div>
        </div>
      </nav>

      {/* ===== HERO — Full viewport, editorial ===== */}
      <section className="flex min-h-screen flex-col justify-center pt-14">
        <div className="mx-auto grid max-w-5xl items-center gap-16 px-8 py-16 lg:grid-cols-2">
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
              <a href="#" className="rounded-full bg-gray-900 px-8 py-3.5 text-sm font-medium text-white hover:bg-gray-800 transition">Jelajahi Katalog</a>
              <a href="#" className="rounded-full px-8 py-3.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition">Pelajari →</a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl bg-gray-50">
              <img src={IMG.hero} alt="" className="h-full w-full object-contain p-8" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES — Large cards, editorial ===== */}
      <section className="py-32">
        <div className="mx-auto max-w-5xl px-8">
          <p className="text-xs font-medium uppercase tracking-[.25em] text-gray-400 mb-4">Kategori</p>
          <h2 className="text-3xl font-light tracking-tight lg:text-4xl">Temukan yang Anda butuhkan</h2>
          <div className="mt-16 grid gap-2">
            {[
              { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial — efisiensi tinggi untuk setiap kebutuhan', c:'12 produk' },
              { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro — konversi daya yang andal', c:'8 produk' },
              { n:'Baterai', d:'Lithium LiFePO4, Rack Mounted, Wall, All-in-One ESS', c:'15 produk' },
              { n:'Paket PLTS', d:'Solusi lengkap untuk rumah, kantor, dan industri', c:'9 produk' },
            ].map((cat,i) => (
              <div key={cat.n} className="group flex cursor-pointer items-center justify-between border-b border-gray-100 py-8 transition hover:border-gray-300">
                <div>
                  <span className="text-xs text-gray-300 mr-3">0{i+1}</span>
                  <h3 className="inline text-xl font-medium">{cat.n}</h3>
                  <p className="mt-2 text-sm text-gray-400 max-w-xl">{cat.d}</p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-sm text-gray-300">{cat.c}</span>
                  <span className="text-2xl text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED — Side by side, large photo ===== */}
      <section className="py-32 bg-gray-50">
        <div className="mx-auto max-w-5xl px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-white h-96">
              <img src={IMG.panel} alt="" className="h-full w-full object-contain p-8" />
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
                <a href="#" className="rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 transition">Beli Sekarang</a>
                <a href="#" className="rounded-full px-8 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition">Detail →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32">
        <div className="mx-auto max-w-2xl px-8 text-center">
          <h2 className="text-3xl font-light tracking-tight lg:text-4xl">Butuh bantuan memilih?</h2>
          <p className="mt-6 text-lg text-gray-500">Tim kami siap membantu Anda menemukan produk yang tepat.</p>
          <a href="#" className="mt-8 inline-block rounded-full bg-gray-900 px-10 py-4 text-sm font-medium text-white hover:bg-gray-800 transition">Konsultasi Gratis</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-5xl px-8 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <span className="text-sm text-gray-400">© 2026 EBTPlaza</span>
            <div className="flex gap-6 text-sm text-gray-400">
              {['Privasi','Syarat','Kontak'].map(l => <a key={l} href="#" className="hover:text-gray-900 transition">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { PrototypeCMegaMenu } from './PrototypeCMegaMenu';

export default function PrototypeCPage() {
  return (
    <div className="min-h-screen bg-black font-sans text-white">
      {/* Nav — glass */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 relative">
          <span className="text-xl font-bold tracking-tight">EBT<span className="text-green-400">Plaza</span></span>
          <div className="hidden items-center gap-8 md:flex">
            <PrototypeCMegaMenu />
            {['Produk','Solusi','Proyek','Tentang'].map(l => (
              <a key={l} href="#" className="text-sm text-gray-400 hover:text-white transition">{l}</a>
            ))}
            <a href="#" className="rounded-full bg-green-500 px-5 py-2 text-sm font-medium text-black hover:bg-green-400 transition">Mulai</a>
          </div>
        </div>
      </nav>

      {/* Hero — full viewport */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-black to-black" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 text-center">
          <div className="mb-6 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">🇮🇩 Platform Energi Terbarukan Indonesia</div>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Masa Depan Energi<br />
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Dimulai di Sini</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400">Dari panel surya hingga sistem penyimpanan energi — kami menyediakan teknologi terbarukan untuk rumah, bisnis, dan industri.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#" className="rounded-full bg-green-500 px-8 py-4 font-semibold text-black hover:bg-green-400 transition">Jelajahi Katalog</a>
            <a href="#" className="rounded-full border border-white/20 px-8 py-4 font-semibold text-white hover:border-white/50 transition backdrop-blur">Konsultasi Gratis →</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {[
              { v:'10+', l:'Brand Resmi' },
              { v:'200+', l:'Produk Tersedia' },
              { v:'34', l:'Provinsi Terjangkau' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-5xl font-bold bg-gradient-to-b from-green-400 to-white bg-clip-text text-transparent">{s.v}</div>
                <p className="mt-2 text-sm text-gray-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Spotlight */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur">
              <img src="/images/prototype/hero-power-station.png" alt="Inverter Hybrid 6kW" className="aspect-square rounded-2xl w-full object-contain p-6" />
            </div>
            <div>
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">PRODUK UNGGULAN</span>
              <h2 className="mt-4 text-3xl font-bold">Inverter Hybrid 6kW</h2>
              <p className="mt-4 leading-relaxed text-gray-400">Teknologi hybrid terbaru — mendukung On-Grid dan Off-Grid dengan efisiensi 98%. Dilengkapi MPPT ganda dan monitoring real-time.</p>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {[
                  { l:'Output', v:'6000W' },{ l:'Efisiensi', v:'98%' },
                  { l:'MPPT', v:'2 Input' },{ l:'Garansi', v:'5 Tahun' },
                ].map(s => (
                  <div key={s.l} className="rounded-xl border border-white/10 p-3">
                    <p className="text-gray-500">{s.l}</p>
                    <p className="text-lg font-bold">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-3xl font-bold text-green-400">Rp 15.900.000</span>
                <a href="#" className="rounded-full bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 transition">Beli Sekarang</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — glass cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">Kategori Produk</h2>
          <p className="mb-12 text-center text-gray-500">Pilih teknologi yang tepat untuk kebutuhan Anda</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n:'Panel Surya', d:'Monocrystalline, Polycrystalline, Bifacial', i:'☀️' },
              { n:'Inverter', d:'Hybrid, On-Grid, Off-Grid, Micro', i:'⚡' },
              { n:'Baterai', d:'Lithium, Rack, Wall Mounted, ESS', i:'🔋' },
              { n:'Charge Controller', d:'MPPT, PWM — semua rating', i:'🎛️' },
              { n:'Paket PLTS', d:'Rumah, Kantor, Industri', i:'🏠' },
              { n:'Mounting', d:'Atap, Ground, Carport', i:'🔩' },
              { n:'Kabel & Proteksi', d:'PV Cable, MC4, MCB, SPD', i:'🔌' },
              { n:'Pompa Air', d:'Submersible, Surface', i:'💧' },
            ].map(c => (
              <div key={c.n} className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-green-500/30 hover:bg-white/10">
                <span className="text-3xl">{c.i}</span>
                <h3 className="mt-4 font-semibold">{c.n}</h3>
                <p className="mt-2 text-sm text-gray-500">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-800" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Siap untuk Proyek Anda?</h2>
          <p className="mb-8 text-green-100">Dapatkan konsultasi gratis dari tim ahli kami.</p>
          <a href="#" className="inline-block rounded-full bg-white px-8 py-4 font-semibold text-green-700 hover:bg-green-50 transition">Hubungi Kami Sekarang</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-green-400">EBTPlaza</h3>
              <p className="mt-2 text-sm text-gray-500">Teknologi energi terbarukan untuk Indonesia.</p>
            </div>
            {[
              { t:'Produk', l:['Panel Surya','Inverter','Baterai','Paket PLTS'] },
              { t:'Perusahaan', l:['Tentang','Blog','Karir','Kontak'] },
              { t:'Legal', l:['Privasi','Syarat','Pengiriman','Garansi'] },
            ].map(c => (
              <div key={c.t}>
                <h3 className="text-sm font-semibold text-gray-400">{c.t}</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">{c.l.map(l => <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-gray-600">© 2026 EBTPlaza</div>
        </div>
      </footer>
    </div>
  );
}

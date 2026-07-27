import { ProtoMegaMenu } from '../ProtoMegaMenu';

const IMG = {
  panel: '/images/prototype/solar-panel-folded.png',
  battery: '/images/prototype/battery-large.png',
  wall: '/images/prototype/battery-wall.png',
  stack: '/images/prototype/battery-stack.png',
  compact: '/images/prototype/battery-compact.png',
};

export default function PrototypeA() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm text-gray-800">
      {/* ===== TOP BAR ===== */}
      <div className="bg-gray-900 text-gray-400 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5">
          <span>🇮🇩 Pengiriman ke seluruh Indonesia • Gratis ongkir min. belanja Rp 5jt</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Bantuan</a>
            <a href="#" className="hover:text-white">Lacak Pesanan</a>
            <a href="#" className="hover:text-white">Daftar</a>
            <a href="#" className="hover:text-white">Masuk</a>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white shadow-sm relative">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-3 py-3">
          <span className="text-xl font-black text-orange-600 shrink-0">EBTPlaza</span>
          <ProtoMegaMenu />
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari panel surya, inverter, baterai..."
                className="w-full rounded border-2 border-orange-400 py-2.5 pl-4 pr-16 text-sm focus:outline-none focus:border-orange-500"
              />
              <button className="absolute right-0 top-0 h-full rounded-r bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-600">Cari</button>
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex shrink-0">
            <button className="relative rounded-lg border px-3 py-2 text-gray-600 hover:bg-gray-50">
              ⚖ <span className="text-xs font-bold text-orange-600">3</span>
            </button>
            <button className="rounded-lg border px-3 py-2 text-gray-600 hover:bg-gray-50">🛒</button>
          </div>
        </div>
        {/* Category tabs */}
        <div className="border-t bg-white">
          <div className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-3 text-xs font-medium">
            {[
              'Panel Surya','Inverter','Baterai','Solar Charger','Paket PLTS',
              'Mounting','Kabel & Proteksi','Pompa Air','Aksesoris'
            ].map((c,i) => (
              <button key={c} className={`shrink-0 px-4 py-2.5 whitespace-nowrap transition ${i === 0 ? 'border-b-2 border-orange-500 text-orange-600 -mb-[1px]' : 'text-gray-500 hover:text-orange-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== PROMO BANNERS ===== */}
      <div className="mx-auto mt-3 max-w-7xl px-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t:'⚡ FLASH SALE', d:'Diskon hingga 40%', c:'bg-red-500' },
            { t:'🆕 PRODUK BARU', d:'EcoFlow DELTA Series', c:'bg-blue-500' },
            { t:'🚚 GRATIS ONGKIR', d:'Min. belanja Rp 5.000.000', c:'bg-green-500' },
          ].map(b => (
            <div key={b.t} className={`${b.c} cursor-pointer rounded-xl p-4 text-white transition hover:opacity-90`}>
              <p className="text-xs opacity-80">{b.t}</p>
              <p className="mt-1 text-base font-bold">{b.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CATEGORY QUICK GRID ===== */}
      <div className="mx-auto mt-3 max-w-7xl px-3">
        <div className="rounded-xl bg-white p-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {[
              { n:'Panel\nSurya', e:'☀️' },{ n:'Inverter', e:'⚡' },{ n:'Baterai', e:'🔋' },
              { n:'Charge\nController', e:'🎛️' },{ n:'Paket\nPLTS', e:'🏠' },{ n:'Mounting', e:'🔩' },
              { n:'Kabel &\nProteksi', e:'🔌' },{ n:'Pompa\nAir', e:'💧' },
            ].map(c => (
              <div key={c.n} className="cursor-pointer rounded-lg p-2 text-center transition hover:bg-orange-50">
                <div className="text-xl">{c.e}</div>
                <div className="mt-1 text-[10px] font-medium leading-tight text-gray-600 whitespace-pre-line">{c.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PRODUCT GRID ===== */}
      <div className="mx-auto mt-4 max-w-7xl px-3">
        <div className="flex items-center justify-between bg-white rounded-t-xl p-3 border-b">
          <h2 className="text-base font-bold">🔥 Rekomendasi Untuk Anda</h2>
          <a href="#" className="text-xs font-bold text-orange-600 hover:underline">Lihat Semua →</a>
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { i:IMG.panel, b:'CLEARANCE', bc:'bg-red-100 text-red-700', n:'Panel 275W Mono', o:'Rp 2.250.000', p:'Rp 1.450.000', r:'4.8', rc:'12' },
            { i:IMG.wall, b:'PROMO', bc:'bg-orange-100 text-orange-700', n:'Power Wall 5.12kWh', o:'Rp 19.400.000', p:'Rp 16.900.000', r:'4.9', rc:'8' },
            { i:IMG.battery, b:'BARU', bc:'bg-blue-100 text-blue-700', n:'Baterai 60Ah', o:'Rp 2.900.000', p:'Rp 1.650.000', r:'4.7', rc:'15' },
            { i:IMG.stack, b:'CHEAPEST', bc:'bg-green-100 text-green-700', n:'Power Station 504Wh', o:'Rp 7.300.000', p:'Rp 6.590.000', r:'4.9', rc:'25' },
            { i:IMG.compact, b:'HOT', bc:'bg-pink-100 text-pink-700', n:'Inverter Hybrid 6kW', o:'Rp 17.900.000', p:'Rp 15.900.000', r:'4.8', rc:'6' },
            { i:IMG.panel, b:'CLEARANCE', bc:'bg-red-100 text-red-700', n:'Panel 440W Bifacial', o:'Rp 2.500.000', p:'Rp 1.800.000', r:'4.6', rc:'20' },
          ].map((p,i) => (
            <div key={i} className="bg-white p-2 transition hover:shadow-md cursor-pointer">
              <div className="relative">
                <div className="mb-2 h-32 overflow-hidden rounded bg-gray-50">
                  <img src={p.i} alt="" className="h-full w-full object-contain p-2" />
                </div>
                <span className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${p.bc}`}>{p.b}</span>
              </div>
              <h3 className="mt-1 text-[11px] leading-tight text-gray-700 line-clamp-2">{p.n}</h3>
              <p className="mt-1 text-sm font-black text-orange-600">{p.p}</p>
              <p className="text-[10px] text-gray-400 line-through">{p.o}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px]">
                <span className="text-yellow-500">★{p.r}</span>
                <span className="text-gray-400">({p.rc})</span>
                <span className="ml-auto text-gray-400">Jakarta</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== BRANDS ROW ===== */}
      <div className="mx-auto mt-4 max-w-7xl px-3">
        <div className="rounded-xl bg-white p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Brand Resmi</h3>
          <div className="flex flex-wrap gap-3">
            {['Mitsubishi Electric','Canadian Solar','LONGi','BLUETTI','BEZVOLT','AIKO','GH Solar','SRNE'].map(b => (
              <span key={b} className="rounded border px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-orange-300 hover:text-orange-600 cursor-pointer transition">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-4 bg-white border-t">
        <div className="mx-auto max-w-7xl px-3 py-8">
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div><h3 className="font-bold mb-2">EBTPlaza</h3><p className="text-gray-400">Marketplace energi terbarukan</p></div>
            {[
              ['Belanja','Panel Surya','Inverter','Baterai','Paket PLTS'],
              ['Layanan','Bandingkan','Permintaan Penawaran','Cek Ongkir','Afiliasi'],
              ['Bantuan','FAQ','Pengiriman','Garansi','Syarat & Ketentuan'],
            ].map((col,i) => (
              <div key={i}><h3 className="font-bold mb-2">{col[0]}</h3><ul className="space-y-1 text-gray-400">{col.slice(1).map(l => <li key={l}><a href="#" className="hover:text-orange-600 transition">{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t text-center text-[10px] text-gray-400">© 2026 EBTPlaza</div>
        </div>
      </footer>
    </div>
  );
}

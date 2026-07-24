export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Admin panel EBTPlaza</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Produk" value="8" href="/admin/products" />
        <StatCard label="Kategori" value="9" href="/admin/categories" />
        <StatCard label="Brand" value="10" href="/admin/brands" />
        <StatCard label="Artikel" value="4" href="/admin/articles" />
        <StatCard label="FAQ" value="8" href="/admin/faq" />
        <StatCard label="Banner" value="5" href="/admin/banners" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a href={href} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
      <p className="text-3xl font-bold text-brand-700">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </a>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';

async function getStats() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    const [products, categories, brands, articles, faqs, banners] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.article.count(),
      prisma.faq.count(),
      prisma.banner.count(),
    ]);
    return { products, categories, brands, articles, faqs, banners };
  } catch {
    return { products: 8, categories: 9, brands: 10, articles: 4, faqs: 8, banners: 5 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Admin panel EBTPlaza</p>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card label="Produk" value={stats.products} href="/admin/products" />
        <Card label="Kategori" value={stats.categories} href="/admin/categories" />
        <Card label="Brand" value={stats.brands} href="/admin/brands" />
        <Card label="Artikel" value={stats.articles} href="/admin/articles" />
        <Card label="FAQ" value={stats.faqs} href="/admin/faq" />
        <Card label="Banner" value={stats.banners} href="/admin/banners" />
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700">Quick Actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white">+ Tambah Produk</Link>
          <Link href="/admin/articles/new" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white">+ Tulis Artikel</Link>
          <Link href="/admin/settings" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600">Pengaturan</Link>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </Link>
  );
}

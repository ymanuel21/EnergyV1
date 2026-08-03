export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminPrisma } from './lib/admin-prisma';
import { aggregateMediaDatabase, countUniqueAssets } from '@/lib/services/media';

async function getStats() {
  try {
    const prisma = await getAdminPrisma();
    const [products, categories, brands, articles, faqs, sections, navLinks] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.article.count(),
      prisma.faq.count(),
      prisma.homepageSectionVersion.count({ where: { status: 'published' } }),
      prisma.navigationLink.count({ where: { enabled: true } }),
    ]);
    // Media — from shared aggregator (same as Media Library)
    const mediaItems = await aggregateMediaDatabase(prisma);
    const assets = countUniqueAssets(mediaItems);

    return { products, categories, brands, articles, faqs, sections, navLinks, assets };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Selamat datang di EBTPlaza Admin</p>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <Card label="Produk" value={stats.products} href="/admin/products" />
          <Card label="Kategori" value={stats.categories} href="/admin/categories" />
          <Card label="Brand" value={stats.brands} href="/admin/brands" />
          <Card label="Artikel" value={stats.articles} href="/admin/articles" />
          <Card label="FAQ" value={stats.faqs} href="/admin/faq" />
          <Card label="Homepage Sections" value={stats.sections} href="/admin/homepage" />
          <Card label="Nav Links" value={stats.navLinks} href="/admin/navigation" />
          <Card label="Media Assets" value={stats.assets} href="/admin/media" />
        </div>
      )}

      {!stats && (
        <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted">Database connection unavailable. Stats will appear when connected.</p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-primary">Quick Actions</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/products/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">+ Tambah Produk</Link>
            <Link href="/admin/articles/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">+ Tulis Artikel</Link>
            <Link href="/admin/homepage" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Homepage Builder</Link>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-primary">Site Management</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/appearance" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Appearance</Link>
            <Link href="/admin/navigation" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Navigation</Link>
            <Link href="/admin/settings" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-6 hover:shadow-sm transition-shadow">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Link>
  );
}

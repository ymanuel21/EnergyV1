import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/api/products';
import { getAllCategories } from '@/lib/api/categories';
import { getAllBrands } from '@/lib/api/brands';
import { getAllArticles } from '@/lib/api/articles';
import { getAllPages } from '@/lib/api/static-pages';
import { SITE_CONFIG } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/produk`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brand`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/promo`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/barang-clearance`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/artikel`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/afiliasi`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/permintaan-penawaran`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const [products, categories, brands, articles, pages] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllBrands(),
    getAllArticles(),
    getAllPages(),
  ]);

  for (const p of products) {
    entries.push({
      url: `${baseUrl}/produk/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const c of categories) {
    entries.push({
      url: `${baseUrl}/kategori/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const b of brands) {
    entries.push({
      url: `${baseUrl}/brand/${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  for (const a of articles) {
    const raw = a as unknown as Record<string, unknown>;
    const articleDate = raw.publishedAt ?? raw.date ?? new Date().toISOString();
    entries.push({
      url: `${baseUrl}/artikel/${a.slug}`,
      lastModified: new Date(articleDate as string),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  for (const sp of pages) {
    entries.push({
      url: `${baseUrl}/halaman/${sp.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  return entries;
}

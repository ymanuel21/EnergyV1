import type { MetadataRoute } from 'next';
import { products } from '@/lib/data/products';
import { categories } from '@/lib/data/categories';
import { brands as brandData } from '@/lib/data/brands';
import { articles } from '@/lib/data/articles';
import { staticPages } from '@/lib/data/static-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energi.click';

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brand`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/promo`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/barang-clearance`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artikel`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/afiliasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/permintaan-penawaran`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Product pages
  for (const p of products) {
    entries.push({
      url: `${baseUrl}/produk/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Category pages
  for (const c of categories) {
    entries.push({
      url: `${baseUrl}/kategori/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Brand pages
  for (const b of brandData) {
    entries.push({
      url: `${baseUrl}/brand/${b.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  // Article pages
  for (const a of articles) {
    entries.push({
      url: `${baseUrl}/artikel/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // Static pages
  for (const sp of staticPages) {
    entries.push({
      url: `${baseUrl}/halaman/${sp.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  return entries;
}

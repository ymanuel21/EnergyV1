import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://energi.click';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/checkout',
          '/keranjang',
          '/wishlist',
          '/perbandingan',
          '/cari?*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

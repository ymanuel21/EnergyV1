// Audit: verify every FAIL and WARNING
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  console.log('=== FAIL MODULES — DB audit ===\n');

  // 1. Banner
  const banners = await prisma.banner.count();
  console.log('Banner:     ', banners, 'records');
  if (banners > 0) {
    const b = await prisma.banner.findMany({ take: 2 });
    console.log('  Sample:', JSON.stringify(b.map(r => ({title: (r as any).title, slug: (r as any).slug}))));
  }

  // 2. Artikel (articles)
  const articles = await prisma.article.count();
  console.log('Artikel:    ', articles, 'records');
  if (articles > 0) {
    const a = await prisma.article.findMany({ take: 2 });
    console.log('  Sample:', JSON.stringify(a.map(r => ({title: (r as any).title, slug: (r as any).slug}))));
  }

  // 3. Halaman (staticPages)
  const pages = await prisma.staticPage.count();
  console.log('Halaman:    ', pages, 'records');
  if (pages > 0) {
    const sp = await prisma.staticPage.findMany({ take: 2 });
    console.log('  Sample:', JSON.stringify(sp.map(r => ({title: (r as any).title, slug: (r as any).slug}))));
  }
  // Check static data fallback
  try {
    const { staticPages } = await import('@/lib/data/static-pages');
    console.log('  Static fallback:', staticPages?.length || 0, 'items in @/lib/data/static-pages');
    if (staticPages?.length) console.log('  Titles:', staticPages.slice(0,3).map((p:any) => p.title).join(', '));
  } catch { console.log('  No static fallback found'); }

  // 4. Testimonials
  const testimonials = await prisma.testimonial.count();
  console.log('Testimonials:', testimonials, 'records');
  if (testimonials > 0) {
    const t = await prisma.testimonial.findMany({ take: 2 });
    console.log('  Sample:', JSON.stringify(t.map(r => ({name: (r as any).name, status: (r as any).status}))));
  }

  // 5. Quote Requests
  const quotes = await prisma.quoteRequest.count();
  console.log('Quotes:     ', quotes, 'records');
  if (quotes > 0) {
    const q = await prisma.quoteRequest.findMany({ take: 2 });
    console.log('  Sample:', JSON.stringify(q.map(r => ({name: (r as any).name, status: (r as any).status}))));
  }

  console.log('\n=== SCHEMA CHECK ===');
  // Verify schemas exist
  const models = ['Banner', 'Article', 'StaticPage', 'Testimonial', 'QuoteRequest'];
  for (const m of models) {
    try {
      const c = await (prisma as any)[m.charAt(0).toLowerCase() + m.slice(1)].count();
      console.log(`  ${m}: count() works, result=${c}`);
    } catch (e: any) { console.log(`  ${m}: ERROR — ${e.message?.substring(0,60)}`); }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();

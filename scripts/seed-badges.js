const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEFAULT_BADGES = [
  { slug: 'promo', name: 'PROMO', color: '#D97706', bgColor: '#FFFBEB', icon: '🔥', sortOrder: 1 },
  { slug: 'clearance', name: 'CLEARANCE', color: '#DC2626', bgColor: '#FEF2F2', icon: '⚡', sortOrder: 2 },
  { slug: 'new', name: 'NEW', color: '#2563EB', bgColor: '#EFF6FF', icon: '✨', sortOrder: 3 },
  { slug: 'cheapest', name: 'CHEAPEST', color: '#059669', bgColor: '#ECFDF5', icon: '💰', sortOrder: 4 },
  { slug: 'best-seller', name: 'BEST SELLER', color: '#7C3AED', bgColor: '#F5F3FF', icon: '⭐', sortOrder: 5 },
  { slug: 'hot', name: 'HOT', color: '#EA580C', bgColor: '#FFF7ED', icon: '🔴', sortOrder: 6 },
  { slug: 'limited', name: 'LIMITED', color: '#BE185D', bgColor: '#FDF2F8', icon: '⏳', sortOrder: 7 },
  { slug: 'preorder', name: 'PREORDER', color: '#0891B2', bgColor: '#ECFEFF', icon: '📦', sortOrder: 8 },
];

async function main() {
  let created = 0;
  for (const badge of DEFAULT_BADGES) {
    try {
      await prisma.badge.upsert({
        where: { slug: badge.slug },
        update: badge,
        create: badge,
      });
      created++;
    } catch (e) {
      console.error(`Failed to seed ${badge.slug}:`, e.message);
    }
  }
  console.log(`Seeded ${created} badges`);

  // Migrate existing product badge strings → ProductBadge relations
  const products = await prisma.product.findMany({
    where: { badges: { not: [] } },
    include: { badgeRelations: true },
  });
  let migrated = 0;

  for (const product of products) {
    const legacyBadges = product.badges || [];
    if (legacyBadges.length === 0) continue;

    for (const badgeSlug of legacyBadges) {
      const badge = await prisma.badge.findUnique({ where: { slug: badgeSlug } });
      if (!badge) continue;

      const exists = product.badgeRelations.some(function(r) { return r.badgeId === badge.id; });
      if (exists) continue;

      await prisma.productBadge.create({
        data: { productId: product.id, badgeId: badge.id },
      });
      migrated++;
    }
  }
  console.log(`Migrated ${migrated} product-badge relations`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });

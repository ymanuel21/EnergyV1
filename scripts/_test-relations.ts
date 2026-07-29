import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const ID = 'p-restore-ms5tqngz-8';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const product = await prisma.product.findUnique({ where: { id: ID }, include: { relations: true } });
console.log('relations type:', typeof product?.relations);
console.log('relations isArray:', Array.isArray(product?.relations));
console.log('relations value:', JSON.stringify(product?.relations));

// Check categories too
const p2 = await prisma.product.findUnique({ where: { id: ID }, include: { categories: true } });
console.log('categories type:', typeof p2?.categories);
console.log('categories isArray:', Array.isArray(p2?.categories));
console.log('categories value:', JSON.stringify(p2?.categories));

// Check badgeRelations
const p3 = await prisma.product.findUnique({ where: { id: ID }, include: { badgeRelations: { include: { badge: true } } } });
console.log('badgeRelations type:', typeof p3?.badgeRelations);
console.log('badgeRelations isArray:', Array.isArray(p3?.badgeRelations));
console.log('badgeRelations value:', JSON.stringify(p3?.badgeRelations));

await prisma.$disconnect();
await pool.end();

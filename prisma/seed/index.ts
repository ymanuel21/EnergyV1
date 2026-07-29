// Master seed — run all seed modules (idempotent)
// Run: npx tsx prisma/seed/index.ts
// Safe to run repeatedly — uses upsert everywhere

import './catalog';
import './homepage';
import './admin';
// Future: import './projects'; import './testimonials';

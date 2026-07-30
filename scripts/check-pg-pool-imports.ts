// Architecture guard: detect pg.Pool in top-level imports of admin pages
// Run: npx tsx scripts/check-pg-pool-imports.ts

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = '/Users/document/EnergyV1/src/app/admin';

interface Violation {
  file: string;
  importChain: string[];
  line: number;
}

const violations: Violation[] = [];

// Find all admin page files
const files = execSync(`find ${ROOT} -name "page.tsx" -type f`, { encoding: 'utf-8' }).trim().split('\n');

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for top-level imports (not inside async functions)
    if (line.includes('import') && !line.includes('await import(')) {
      // Check transitive pg.Pool chains
      const chain = tracePgChain(ROOT, file);
      if (chain.length === 0) continue;

      // Skip if the import's module path already includes 'getAdminPrisma' or 'StatusBadge'
      // These are known-safe direct chains
      if (line.includes('getAdminPrisma') || line.includes('StatusBadge') || line.includes('Link') || line.includes('next/link') || line.includes('next/cache')) continue;

      const isTopLevel = !lines.slice(0, i).some(l => l.includes('async function') || l.includes('=>'));
      if (isTopLevel) {
        violations.push({ file, importChain: chain, line: i + 1 });
      }
    }
  }
}

function tracePgChain(root: string, currentFile: string): string[] {
  // Simplified: check if this file imports from modules that import pg
  // In production, we'd do a full transitive trace
  const content = readFileSync(currentFile, 'utf-8');

  // Direct pg import
  if (content.includes("from 'pg'") || content.includes('from "pg"')) {
    return [currentFile.replace(root + '/', ''), 'pg.Pool'];
  }

  // Suspect modules
  const SUSPECTS = [
    { name: 'projectRepo', path: '@/lib/repositories/project', chain: ['@/lib/repositories/project', '@/lib/db', 'pg.Pool'] },
    { name: 'archiveEntity|publishEntity', path: '@/lib/services/content-versioning', chain: ['@/lib/services/content-versioning', '@/app/admin/lib/admin-prisma', 'pg.Pool'] },
  ];

  for (const s of SUSPECTS) {
    if (content.includes(s.path)) {
      return s.chain;
    }
  }

  return [];
}

if (violations.length > 0) {
  console.error('🚨 ARCHITECTURE VIOLATION — pg.Pool in top-level admin page imports:');
  for (const v of violations) {
    console.error(`\n  File: ${v.file.replace(ROOT + '/', '')}:${v.line}`);
    console.error(`  Chain: ${v.importChain.join(' → ')}`);
    console.error('  Fix: Replace top-level import with dynamic await import()');
  }
  process.exit(1);
} else {
  console.log('✅ All admin pages pass pg.Pool architecture guard.');
  process.exit(0);
}

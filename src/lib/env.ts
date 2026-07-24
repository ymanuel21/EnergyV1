/**
 * Validates required environment variables at RUNTIME.
 * Does NOT run at module import time (to avoid breaking Next.js build).
 * Call `ensureEnv()` at the top of server actions / API routes.
 */

const REQUIRED_VARS = {
  ADMIN_EMAIL: 'Admin login email',
  ADMIN_PASSWORD: 'Admin login password',
  AUTH_SECRET: 'NextAuth secret key for JWT encryption (generate with: npx auth secret)',
  DATABASE_URL: 'PostgreSQL connection string for Prisma',
} as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const missing: string[] = [];

  for (const [key, description] of Object.entries(REQUIRED_VARS)) {
    if (!process.env[key] || process.env[key]!.trim() === '') {
      missing.push(`  - ${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    const message = [
      '',
      '╔══════════════════════════════════════════════════════╗',
      '║  MISSING REQUIRED ENVIRONMENT VARIABLES              ║',
      '╚══════════════════════════════════════════════════════╝',
      '',
      'The following environment variables are required but not set:',
      '',
      ...missing,
      '',
      'Set them in your .env file or deployment environment.',
    ].join('\n');

    throw new Error(message);
  }
}

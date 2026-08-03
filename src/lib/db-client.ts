/**
 * Client-safe fallback utilities.
 * Does NOT import Prisma or any Node.js modules.
 * Public pages import from here instead of @/lib/db.
 */

/** Try Prisma first, fall back to static data if DB unavailable */
export async function prismaOrFallback<T>(
  importer: () => Promise<{ getPrisma: () => Promise<any> }>,
  prismaFn: (prisma: any) => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    if (process.env.DATABASE_URL) {
      const { getPrisma } = await importer();
      const prisma = await getPrisma();
      const result = await prismaFn(prisma);
      if (Array.isArray(result) && result.length > 0) return result;
      if (result && !Array.isArray(result)) return result;
    }
  } catch (e) {
    console.error('Prisma query failed:', (e as Error).message);
  }
  return fallback();
}

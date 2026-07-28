import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import { saveRevision, logActivity } from '@/lib/admin-core';
import { z } from 'zod';

/** Execute a multi-step write in a transaction. Rolls back on any error. */
export async function transaction<T>(fn: (prisma: ReturnType<typeof getAdminPrisma> extends Promise<infer P> ? P : never) => Promise<T>): Promise<T> {
  const prisma = await getAdminPrisma();
  return prisma.$transaction(async (tx: any) => fn(tx));
}

/** Validate and throw on failure. Returns parsed data. */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown, label?: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Validation failed${label ? ` for ${label}` : ''}: ${errors}`);
  }
  return result.data;
}

/** One-shot: validate, execute in transaction, save revision, log activity. */
export async function safeWrite<T>(params: {
  entityType: string;
  entityId?: string;
  entityName?: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  schema: z.ZodSchema<any>;
  execute: (prisma: any) => Promise<T>;
}): Promise<T> {
  const validated = validate(params.schema, params.data, params.entityType);
  return transaction(async (tx) => {
    // Save revision if updating existing entity
    if (params.action === 'update' && params.entityId) {
      const existing = await (tx as any)[params.entityType].findUnique?.({ where: { id: params.entityId } });
      if (existing) {
        await saveRevision(params.entityType, params.entityId!, { ...existing });
      }
    }
    const result = await params.execute(tx);
    await logActivity(params.action, params.entityType, params.entityName);
    return result;
  });
}

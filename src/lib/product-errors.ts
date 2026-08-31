// Structured product-creation errors.
//
// These are the ONLY error shapes returned to the browser — they never carry
// raw Prisma messages, SQL, stack traces, connection strings, or other
// implementation details. The full technical exception is logged server-side
// via src/lib/observability.ts (logger.error) and stays out of the client.
//
// This module is safe to import from BOTH server and client bundles: it only
// uses the Web Crypto API (`globalThis.crypto`), available in Node 19+ and in
// every browser.

export type ProductCreateError = {
  success: false;
  code: string;
  message: string;
  field?: string;
  reportId: string;
};

export type ProductCreateResult = { success: true } | ProductCreateError;

// Correlation-ID alphabet (no ambiguous 0/O/1/I/L).
const REPORT_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomToken(length: number): string {
  const arr = new Uint32Array(length);
  globalThis.crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += REPORT_ID_ALPHABET[arr[i] % REPORT_ID_ALPHABET.length];
  }
  return out;
}

/** Generate a correlation/report ID: `ERR-YYYYMMDD-XXXXX`. */
export function makeReportId(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `ERR-${y}${m}${day}-${randomToken(5)}`;
}

/** Map a thrown server error into a safe, structured product-create error. */
export function toProductCreateError(error: unknown, reportId: string): ProductCreateError {
  const code = (error as { code?: string } | null)?.code;
  const meta = (error as { meta?: { target?: unknown } } | null)?.meta;

  // Prisma unique-constraint violation (P2002)
  if (code === 'P2002') {
    const target: unknown[] = Array.isArray(meta?.target) ? (meta!.target as unknown[]) : [];
    if (target.includes('slug')) {
      return {
        success: false,
        code: 'PROD_DATABASE_DUPLICATE_SLUG_001',
        message: 'Slug sudah digunakan. Silakan gunakan slug yang berbeda.',
        field: 'slug',
        reportId,
      };
    }
    if (target.includes('sku')) {
      return {
        success: false,
        code: 'PROD_DATABASE_DUPLICATE_SKU_001',
        message: 'SKU sudah digunakan oleh produk lain. Silakan gunakan SKU yang berbeda.',
        field: 'sku',
        reportId,
      };
    }
    return {
      success: false,
      code: 'PROD_DATABASE_UNIQUE_001',
      message: 'Data yang Anda masukkan sudah digunakan oleh produk lain.',
      reportId,
    };
  }

  // Prisma foreign-key violation (P2003)
  if (code === 'P2003') {
    return {
      success: false,
      code: 'PROD_DATABASE_FK_001',
      message: 'Brand atau kategori yang dipilih tidak valid. Silakan pilih ulang.',
      reportId,
    };
  }

  // Auth / session expiry
  const message = (error as { message?: string } | null)?.message;
  if (typeof message === 'string' && (message === 'Unauthorized' || message.includes('Unauthorized'))) {
    return {
      success: false,
      code: 'PROD_AUTH_001',
      message: 'Sesi login Anda sudah berakhir. Silakan login kembali lalu coba lagi.',
      reportId,
    };
  }

  // Unexpected
  return {
    success: false,
    code: 'PROD_SERVER_001',
    message: 'Produk tidak dapat disimpan karena terjadi masalah pada server. Silakan coba lagi.',
    reportId,
  };
}

/** Map zod validation issues to a field-specific product validation error. */
export function toProductValidationError(
  issues: { path: PropertyKey[]; message: string }[],
  reportId: string,
): ProductCreateError {
  const first = issues[0];
  const field = first && first.path.length ? String(first.path[0]) : undefined;
  const message = first?.message ?? 'Data produk tidak valid.';
  const code = field
    ? `PROD_VALIDATION_${field.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_001`
    : 'PROD_VALIDATION_001';
  return { success: false, code, message, field, reportId };
}

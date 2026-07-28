import { performance } from 'perf_hooks';

export interface RequestMetrics {
  path: string;
  method: string;
  durationMs: number;
  status: number;
  dbQueryCount?: number;
  timestamp: string;
}

const metricsBuffer: RequestMetrics[] = [];
const MAX_BUFFER = 100;

export function recordRequestMetric(metric: RequestMetrics) {
  metricsBuffer.push(metric);
  if (metricsBuffer.length > MAX_BUFFER) metricsBuffer.shift();
}

export function getMetrics() {
  return {
    requests: metricsBuffer,
    avgDuration: metricsBuffer.length
      ? metricsBuffer.reduce((s, m) => s + m.durationMs, 0) / metricsBuffer.length
      : 0,
    p95: metricsBuffer.length
      ? [...metricsBuffer].sort((a, b) => b.durationMs - a.durationMs)[Math.floor(metricsBuffer.length * 0.05)]?.durationMs ?? 0
      : 0,
    total: metricsBuffer.length,
  };
}

/** Wrap a function to measure its duration */
export async function measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    if (duration > 100) {
      console.warn(`[SLOW] ${label}: ${duration.toFixed(0)}ms`);
    }
  }
}

/** Structured logger */
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: 'info', msg, ...meta, ts: new Date().toISOString() })),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...meta, ts: new Date().toISOString() })),
  error: (msg: string, meta?: Record<string, unknown>) =>
    console.error(JSON.stringify({ level: 'error', msg, ...meta, ts: new Date().toISOString() })),
};

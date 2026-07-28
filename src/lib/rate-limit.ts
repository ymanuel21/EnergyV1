import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for public API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/quotes':  { max: 10,  windowMs: 60_000 },      // 10/min
  '/api/asset':   { max: 100, windowMs: 60_000 },       // 100/min
  '/api/upload':  { max: 30,  windowMs: 60_000 },       // 30/min
  default:        { max: 200, windowMs: 60_000 },       // 200/min
};

export function rateLimit(request: NextRequest, next: () => Promise<NextResponse>): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const limit = Object.entries(RATE_LIMITS).find(([k]) => path.startsWith(k))?.[1]
    || Object.entries(RATE_LIMITS).find(([k]) => k === 'default')?.[1]
    || { max: 100, windowMs: 60_000 };

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${ip}:${path}`;

  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry && now < entry.resetAt) {
    if (entry.count >= limit.max) {
      return Promise.resolve(
        NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } })
      );
    }
    entry.count++;
  } else {
    rateLimitMap.set(key, { count: 1, resetAt: now + limit.windowMs });
  }

  // Cleanup old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }

  return next();
}

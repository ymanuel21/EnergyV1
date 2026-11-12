import { NextResponse } from 'next/server';
import { getPublicNavigationLinks } from '@/lib/api/navigation';

// Phase 1: fetched client-side by Header and MobileMenu on every page view.
// The payload is locale-dependent (NEXT_LOCALE), so it must never be shared between
// visitors: the response is private and varies on the cookie. The underlying DB read keeps
// its own 5-minute, locale-scoped cache, so this still costs one query per language.
export const dynamic = 'force-dynamic';

const CACHE_HEADERS = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export async function GET() {
  const links = await getPublicNavigationLinks();
  return NextResponse.json(links, { headers: CACHE_HEADERS });
}

// POST /api/admin/session/refresh
// Issues a new JWT with updated expiration
// CSRF: protected by existing auth cookie (httpOnly, sameSite=lax)
// Only refreshes tokens within refresh window of expiry
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || '');
const MAX_AGE = 24 * 60 * 60;        // 24 hours
const REFRESH_WINDOW = 60 * 60;       // allow refresh within 1 hour of expiry
const COOKIE_NAME = 'authjs.session-token';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value
      || cookieStore.get(`__Secure-${COOKIE_NAME}`)?.value;

    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Verify existing JWT — rejects expired/tampered tokens
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256'],
    });

    const now = Math.floor(Date.now() / 1000);
    const timeRemaining = (payload.exp || 0) - now;

    // Fully expired — cannot refresh
    if (timeRemaining <= 0) {
      // Clear the expired cookie
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Still far from expiry — no refresh needed
    if (timeRemaining > REFRESH_WINDOW) {
      return NextResponse.json({
        ok: true,
        message: 'Session still valid',
        expiresIn: timeRemaining,
      });
    }

    // Issue new JWT — preserve claims but update exp
    const { exp, iat, ...claims } = payload;
    const newToken = await new SignJWT(claims)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${MAX_AGE}s`)
      .sign(SECRET);

    cookieStore.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    });

    return NextResponse.json({
      ok: true,
      message: 'Session refreshed',
      expiresIn: MAX_AGE,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

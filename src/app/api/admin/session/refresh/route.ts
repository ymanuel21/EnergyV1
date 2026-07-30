// POST /api/admin/session/refresh
// Issues a new JWT with updated expiration
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || '');
const REFRESH_WINDOW = 60 * 60; // allow refresh within 1 hour of expiry

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authjs.session-token')?.value
      || cookieStore.get('__Secure-authjs.session-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No session cookie' }, { status: 401 });
    }

    // Verify existing JWT
    const { payload } = await jwtVerify(token, SECRET);
    const now = Math.floor(Date.now() / 1000);

    // Only refresh if within the refresh window of expiry
    if (payload.exp && payload.exp - now > REFRESH_WINDOW) {
      return NextResponse.json({
        ok: true,
        message: 'Session still valid, no refresh needed',
        expiresIn: payload.exp - now,
      });
    }

    // Issue new JWT with extended expiration
    const maxAge = 24 * 60 * 60; // 24 hours
    const newToken = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${maxAge}s`)
      .sign(SECRET);

    cookieStore.set('authjs.session-token', newToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return NextResponse.json({
      ok: true,
      message: 'Session refreshed',
      expiresIn: maxAge,
    });
  } catch (e: any) {
    console.error('Session refresh error:', e.message);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}

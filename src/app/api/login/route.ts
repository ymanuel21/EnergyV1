import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  if (!isDev) {
    const ip = getClientIp(request);
    if (isRateLimited(`login:${ip}`, 10, 60_000)) {
      return Response.json({ error: 'RateLimited' }, { status: 429 });
    }
  }

  try {
    const formData = await request.formData();
    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });

    if (result && 'error' in result) {
      return Response.json({ error: String(result.error) }, { status: 401 });
    }

    // Success — signIn sets session cookie, redirect for client
    return NextResponse.redirect(new URL('/admin', request.url));
  } catch (err: any) {
    const errorCode = err?.cause?.code || err?.code || 'default';
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', errorCode);
    return NextResponse.redirect(url);
  }
}

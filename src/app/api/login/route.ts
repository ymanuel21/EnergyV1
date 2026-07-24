import { NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  // Rate limit in production only: max 10 attempts per IP per 60 seconds
  if (!isDev) {
    const ip = getClientIp(request);
    if (isRateLimited(`login:${ip}`, 10, 60_000)) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('error', 'RateLimited');
      return NextResponse.redirect(url);
    }
  }

  try {
    const formData = await request.formData();
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });

    const response = NextResponse.redirect(new URL('/admin', request.url));
    return response;
  } catch {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('error', 'CredentialsSignin');
    return NextResponse.redirect(url);
  }
}

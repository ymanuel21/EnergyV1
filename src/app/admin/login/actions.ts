'use server';

import { signIn } from '@/lib/auth';

export async function loginAction(prevState: any, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    });
    // Success — return empty object to trigger navigation
    return { success: true };
  } catch (error: any) {
    return { error: 'Email atau password salah' };
  }
}

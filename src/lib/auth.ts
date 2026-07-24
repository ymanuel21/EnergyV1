import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@ebtplaza.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ebtplaza2026';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin', email: ADMIN_EMAIL };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
});

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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

        // Validate required env vars exist (synchronous check, no dynamic import)
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
          throw new Error(
            'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables. ' +
            'These are required for admin authentication. Set them in your .env file.'
          );
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin', email: process.env.ADMIN_EMAIL };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  trustHost: true,
});

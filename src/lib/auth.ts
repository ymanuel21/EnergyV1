import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
          throw new Error(
            'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables. ' +
            'These are required for admin authentication. Set them in your .env file.'
          );
        }

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          // Look up role from AdminUser table (graceful fallback to 'admin')
          let role = 'admin';
          try {
            const prisma = await getAdminPrisma();
            const adminUser = await prisma.adminUser.findUnique({ where: { email } });
            if (adminUser) role = adminUser.role;
          } catch { /* DB not available — default to admin */ }

          return { id: '1', name: 'Admin', email, role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role || 'admin';
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role || 'admin';
      return session;
    },
  },
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 }, // 24 hours absolute expiry
  trustHost: true,
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
});

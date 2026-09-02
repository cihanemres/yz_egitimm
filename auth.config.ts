import type { NextAuthConfig } from 'next-auth';

/**
 * Edge (middleware) tarafında da çalışabilen, Prisma/bcrypt içermeyen
 * temel NextAuth yapılandırması. Providers listesi auth.ts içinde eklenir.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

import type { NextAuthConfig } from 'next-auth';

type SessionUserWithAuth = {
  id?: string;
  role?: unknown;
  isApproved?: unknown;
};

export const authConfig = {
  trustHost: true,
  providers: [], // Providers are added in auth.ts to avoid Edge Runtime issues
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & SessionUserWithAuth;
        sessionUser.id = token.id as string;
        sessionUser.role = token.role;
        sessionUser.isApproved = token.role === 'ADMIN' || token.isApproved;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

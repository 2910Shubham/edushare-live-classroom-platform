import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
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
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).isApproved = token.isApproved;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

import type { Session } from 'next-auth';
import { db } from '@/lib/db';
import type { Role } from '@prisma/client';

export type ResolvedAnalyticsUser = {
  userId: string;
  role: Role;
};

/**
 * JWT session.user.id can be stale or out of sync with the User table.
 * Resolve the canonical DB user before writing analytics rows (FK on userId).
 */
export async function resolveAnalyticsUser(
  session: Session | null
): Promise<ResolvedAnalyticsUser | null> {
  if (!session?.user) return null;

  const tokenId = session.user.id?.trim();
  const email = session.user.email?.trim().toLowerCase();

  if (tokenId) {
    const byId = await db.user.findUnique({
      where: { id: tokenId },
      select: { id: true, role: true },
    });
    if (byId) {
      return { userId: byId.id, role: byId.role };
    }
  }

  if (email) {
    const byEmail = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (byEmail) {
      return { userId: byEmail.id, role: byEmail.role };
    }
  }

  return null;
}

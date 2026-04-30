import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isApproved: true },
  });

  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const pendingRole = cookieStore.get('edushare_pending_role')?.value;

  if (user.role === 'ADMIN') redirect('/admin');

  if (!user.isApproved && pendingRole && (pendingRole === 'TEACHER' || pendingRole === 'STUDENT')) {
    await db.user.update({
      where: { id: session.user.id },
      data: { role: pendingRole, isApproved: false },
    });

    // Role has been set and now needs admin approval.
    redirect('/pending-approval');
  }

  // No pending role, or the user is already approved, so keep current approval.
  if (!user.isApproved) redirect('/pending-approval');
  if (user.role === 'TEACHER') redirect('/teacher');
  redirect('/student');
}

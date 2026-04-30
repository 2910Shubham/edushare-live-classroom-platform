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

  // Check if there's a pending role from registration
  // We read from a cookie instead of localStorage since this is a server component
  const cookieStore = await cookies();
  const pendingRole = cookieStore.get('edushare_pending_role')?.value;

  if (pendingRole && (pendingRole === 'TEACHER' || pendingRole === 'STUDENT')) {
    await db.user.update({
      where: { id: session.user.id },
      data: { role: pendingRole, isApproved: false },
    });

    // Role has been set — redirect based on approval
    redirect('/pending-approval');
  }

  // No pending role — redirect based on current role
  if (user.role === 'ADMIN') redirect('/admin');
  if (!user.isApproved) redirect('/pending-approval');
  if (user.role === 'TEACHER') redirect('/teacher');
  redirect('/student');
}

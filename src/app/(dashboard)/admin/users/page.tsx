import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '../AdminDashboardClient';

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role;
  const currentUserId = session?.user?.id;

  if (!currentUserId || role !== 'ADMIN') {
    redirect('/');
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', marginBottom: 24 }}>User Management</h1>
      <AdminDashboardClient initialUsers={users} currentUserId={currentUserId} />
    </div>
  );
}

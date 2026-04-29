import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role;

  if (role !== 'ADMIN') {
    redirect('/');
  }

  const pendingTeachers = await db.user.findMany({
    where: {
      role: 'TEACHER',
      isApproved: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', marginBottom: 24 }}>Admin Dashboard</h1>
      <AdminDashboardClient initialTeachers={pendingTeachers} />
    </div>
  );
}

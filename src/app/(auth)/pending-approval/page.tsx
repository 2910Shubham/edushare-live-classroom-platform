import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PendingApprovalClient } from './PendingApprovalClient';

export default async function PendingApprovalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>).role as string;
  const isApproved = (session.user as Record<string, unknown>).isApproved as boolean;

  if (isApproved) {
    redirect(role === 'TEACHER' ? '/teacher' : '/student');
  }

  return <PendingApprovalClient />;
}

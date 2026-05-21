import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminAnalyticsClient } from './AdminAnalyticsClient';

export default async function AdminAnalyticsPage() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role;

  if (!session?.user?.id || role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminAnalyticsClient />;
}

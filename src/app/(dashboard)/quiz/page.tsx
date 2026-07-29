import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { QuizHost } from '@/components/quiz/QuizHost';

export default async function QuizPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>).role as string;

  if (role !== 'TEACHER' && role !== 'ADMIN') {
    redirect('/student');
  }

  return <QuizHost />;
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NotesCard } from '@/components/student/NotesCard';
import { BookOpen } from 'lucide-react';
import { PageBackground } from '@/components/ui/PageBackground';
import type { Prisma } from '@prisma/client';

export default async function StudentLibraryPage({
  searchParams,
}: {
  searchParams: { classroomId?: string };
}) {
  const session = await auth();

  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;

  if (!session?.user || (role !== 'STUDENT' && role !== 'ADMIN')) {
    redirect('/login');
  }

  const classroomId = searchParams.classroomId;

  const whereClause: Prisma.StudentNoteWhereInput = { userId: session.user.id };
  if (classroomId) {
    whereClause.material = { classroomId };
  }

  const notes = await db.studentNote.findMany({
    where: whereClause,
    include: {
      material: {
        select: { title: true, classroom: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageBackground variant="student" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--clay-ink)',
              marginBottom: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            My Library 📚
          </h1>
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 16 }}>
            Access all your class notes and AI-generated summaries in one place.
          </p>
        </div>

        {notes.length === 0 ? (
          <div className="clay clay-lg" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div className="clay-icon clay-icon-purple" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px' }} aria-hidden="true">
              <BookOpen size={30} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No notes yet
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 15, maxWidth: 340, margin: '0 auto', lineHeight: 1.6 }}>
              When your teacher shares materials, AI will automatically generate study notes for you here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {notes.map((note) => (
              <NotesCard
                key={note.id}
                id={note.id}
                materialTitle={note.material.title}
                content={note.content}
                isAIGenerated={note.isAIGenerated}
                createdAt={note.createdAt.toISOString()}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NotesCard } from '@/components/student/NotesCard';
import { BookOpen } from 'lucide-react';
import { PageBackground } from '@/components/ui/PageBackground';

export default async function StudentLibraryPage({
  searchParams,
}: {
  searchParams: { classroomId?: string };
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'STUDENT') {
    redirect('/login');
  }

  const classroomId = searchParams.classroomId;

  const whereClause: any = { userId: session.user.id };
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
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#2D2B55',
              marginBottom: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            My Library 📚
          </h1>
          <p style={{ color: '#5A5880', fontSize: 16 }}>
            Access all your class notes and AI-generated summaries in one place.
          </p>
        </div>

        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFFFF', borderRadius: 20, border: '1px dashed rgba(108,99,255,0.2)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(108,99,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <BookOpen size={32} color="#6C63FF" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No notes yet
            </h3>
            <p style={{ color: '#5A5880', fontSize: 15, maxWidth: 320, margin: '0 auto' }}>
              When your teacher shares materials, AI will automatically generate study notes for you here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
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

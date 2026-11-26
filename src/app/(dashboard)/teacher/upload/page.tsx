import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { PageBackground } from '@/components/ui/PageBackground';
import { UploadPanel } from '@/components/teacher/UploadPanel';

export default async function TeacherUploadPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as Record<string, unknown>).role as string;

  const classrooms = await db.classroom.findMany({
    where: role === 'ADMIN' ? {} : { teacherId: session.user.id },
    select: { id: true, name: true, subject: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageBackground variant="teacher" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 820, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Upload Material
          </h1>
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 16 }}>
            Share documents and resources with your students.
          </p>
        </div>

        {classrooms.length === 0 ? (
          <div className="clay clay-lg" style={{ padding: '56px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8 }}>
              No Classrooms Yet
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', marginBottom: 8 }}>
              You need to create a classroom from your dashboard before you can upload materials.
            </p>
          </div>
        ) : (
          <div className="clay clay-lg">
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 20 }}>
              Select a classroom to upload to:
            </h2>
            <div style={{ display: 'grid', gap: 20 }}>
              {classrooms.map((c) => (
                <div key={c.id} className="clay-row" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 14 }}>
                    {c.name} {c.subject ? `— ${c.subject}` : ''}
                  </h3>
                  <UploadPanel classroomId={c.id} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

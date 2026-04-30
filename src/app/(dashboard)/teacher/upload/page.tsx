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
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Upload Material
          </h1>
          <p style={{ color: '#5A5880', fontSize: 16 }}>
            Share documents and resources with your students.
          </p>
        </div>

        {classrooms.length === 0 ? (
          <div className="edu-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 8 }}>
              No Classrooms Yet
            </h3>
            <p style={{ color: '#5A5880', marginBottom: 24 }}>
              You need to create a classroom from your dashboard before you can upload materials.
            </p>
          </div>
        ) : (
          <div className="edu-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#2D2B55', marginBottom: 24 }}>
              Select a classroom to upload to:
            </h2>
            <div style={{ display: 'grid', gap: 24 }}>
              {classrooms.map(c => (
                <div key={c.id} style={{ border: '1px solid rgba(108,99,255,0.1)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2D2B55', marginBottom: 16 }}>
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

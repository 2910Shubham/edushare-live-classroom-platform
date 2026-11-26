import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageBackground } from '@/components/ui/PageBackground';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NotesCard } from '@/components/student/NotesCard';
import { StudentMaterialsClient } from '@/components/student/StudentMaterialsClient';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';

export default async function StudentClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const classroomId = resolvedParams.id;

  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    include: {
      teacher: true,
      materials: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!classroom) {
    redirect('/student');
  }

  const notes = await db.studentNote.findMany({
    where: {
      userId: session.user.id,
      material: { classroomId },
    },
    include: { material: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <PageBackground variant="student" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div className="clay clay-md" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/student"
              className="clay-pill"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
            <PushNotificationToggle />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>
            {classroom.name}
          </h1>
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 15 }}>Taught by {classroom.teacher.name}</p>
        </div>

        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
          
          {/* Materials Section */}
          <div className="clay clay-md" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="clay-icon clay-icon-sm clay-icon-purple" style={{ width: 36, height: 36, borderRadius: 12 }} aria-hidden="true">
                <FileText size={18} />
              </span>
              Class Materials
            </h2>
            
            <StudentMaterialsClient
              materials={classroom.materials.map((m) => ({
                id: m.id,
                title: m.title,
                type: m.type as any,
                fileUrl: m.fileUrl,
                fileSize: m.fileSize,
                mimeType: m.mimeType,
                createdAt: m.createdAt.toISOString(),
              }))}
            />
          </div>

          {/* Notes Section */}
          <div className="clay clay-md" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ AI Generated Notes
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {notes.length === 0 ? (
                <p style={{ color: 'var(--clay-ink-soft)', fontSize: 15 }}>No notes have been generated yet.</p>
              ) : (
                notes.map((note) => (
                  <NotesCard 
                    key={note.id} 
                    id={note.id}
                    materialTitle={note.material.title}
                    content={note.content}
                    isAIGenerated={note.isAIGenerated}
                    createdAt={note.createdAt.toISOString()}
                  />
                ))
              )}
            </div>
          </div>
          
        </div>

        {/* Chat Panel */}
        <ChatPanel
          classroomId={classroomId}
          currentUserId={session.user.id!}
          materials={classroom.materials.map((m) => ({ id: m.id, title: m.title, type: m.type }))}
        />
      </div>
    </>
  );
}

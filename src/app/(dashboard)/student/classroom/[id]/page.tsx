import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageBackground } from '@/components/ui/PageBackground';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { NotesCard } from '@/components/student/NotesCard';

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
      <div style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/student" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5A5880', textDecoration: 'none', marginBottom: 16 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {classroom.name}
          </h1>
          <p style={{ color: '#5A5880' }}>Taught by {classroom.teacher.name}</p>
        </div>

        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
          
          {/* Materials Section */}
          <div className="edu-card" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#6C63FF" />
              Class Materials
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classroom.materials.length === 0 ? (
                <p style={{ color: '#A8A6C8', fontSize: 15 }}>No materials have been uploaded yet.</p>
              ) : (
                classroom.materials.map((material) => (
                  <div key={material.id} style={{ padding: 16, border: '1px solid rgba(108,99,255,0.1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.5)' }}>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#2D2B55', fontSize: 16 }}>{material.title}</h3>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 13, color: '#5A5880' }}>
                        <span className="badge-subject">{material.type}</span>
                        <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                      <Download size={16} />
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="edu-card" style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ AI Generated Notes
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {notes.length === 0 ? (
                <p style={{ color: '#A8A6C8', fontSize: 15 }}>No notes have been generated yet.</p>
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
      </div>
    </>
  );
}

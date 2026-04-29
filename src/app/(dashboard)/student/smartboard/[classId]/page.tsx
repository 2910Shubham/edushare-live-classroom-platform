import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SmartBoard } from '@/components/smartboard/SmartBoard';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageBackground } from '@/components/ui/PageBackground';

export default async function StudentSmartBoardPage({ params }: { params: { classId: string } }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== 'STUDENT') {
    redirect('/login');
  }

  const classroomId = params.classId;

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_classroomId: {
        userId: session.user.id,
        classroomId: classroomId,
      },
    },
    include: {
      classroom: {
        include: {
          teacher: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!enrollment) {
    redirect('/student');
  }

  const classroom = enrollment.classroom;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#F8F7FF' }}>
      <PageBackground variant="student" />
      
      {/* Top Bar */}
      <div 
        style={{ 
          background: 'rgba(255,255,255,0.9)', 
          backdropFilter: 'blur(12px)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(108, 99, 255, 0.08)',
          position: 'relative',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link 
            href="/student" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 36, 
              height: 36, 
              borderRadius: '50%',
              background: 'rgba(108,99,255,0.08)',
              color: '#6C63FF',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 }}>
              {classroom.name}
            </h1>
            <p style={{ fontSize: 13, color: '#5A5880' }}>
              Teacher: {classroom.teacher?.name}
            </p>
          </div>
        </div>

        <Link 
          href={`/student/library?classroomId=${classroomId}`}
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <FileText size={18} />
          My Notes
        </Link>
      </div>

      {/* Main Board */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, padding: 24, overflow: 'hidden' }}>
        <SmartBoard classroomId={classroomId} role="STUDENT" />
      </div>
      
      {/* Floating take notes button - to be implemented fully in Phase 4 */}
      <button 
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 30,
          background: 'linear-gradient(135deg, #43E8D8 0%, #36D5C5 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 16,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 32px rgba(67, 232, 216, 0.4)',
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: 16,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <FileText size={24} />
        Take Notes
      </button>
    </div>
  );
}

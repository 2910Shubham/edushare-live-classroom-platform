import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SmartBoard } from '@/components/smartboard/SmartBoard';
import { UploadPanel } from '@/components/teacher/UploadPanel';
import { MaterialList } from '@/components/teacher/MaterialList';
import { Users, StopCircle } from 'lucide-react';
import Link from 'next/link';
import type { Material } from '@/types';

export default async function TeacherClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  const role = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;

  if (!session?.user || (role !== 'TEACHER' && role !== 'ADMIN')) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const classroomId = resolvedParams.id;

  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    include: {
      materials: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!classroom || (role !== 'ADMIN' && classroom.teacherId !== session.user.id)) {
    redirect('/teacher');
  }

  return (
    <div className="classroom-layout" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      {/* Top Bar */}
      <div 
        className="classroom-topbar"
        style={{ 
          background: '#FFFFFF', 
          borderRadius: 20, 
          padding: '16px 24px', 
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 24px rgba(108, 99, 255, 0.08)',
          border: '1px solid rgba(108, 99, 255, 0.08)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {classroom.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#5A5880', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} />
              {classroom._count.enrollments} Enrolled
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#A8A6C8' }} />
            <span style={{ fontSize: 13, color: '#5A5880' }}>
              Join Code: <strong style={{ color: '#6C63FF', letterSpacing: 1 }}>{classroom.code}</strong>
            </span>
          </div>
        </div>

        <Link 
          href="/teacher"
          className="btn-danger" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <StopCircle size={18} />
          End Session
        </Link>
      </div>

      {/* Main Content: Sidebar + Board */}
      <div className="classroom-layout" style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div className="classroom-sidebar" style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', paddingRight: 8 }}>
          <UploadPanel classroomId={classroomId} />
          <MaterialList initialMaterials={classroom.materials as Material[]} classroomId={classroomId} />
        </div>

        {/* Board Area */}
        <div className="classroom-board" style={{ flex: 1, position: 'relative' }}>
          {/* We will add AnnotationToolbar here in Phase 3 */}
          <SmartBoard classroomId={classroomId} role="TEACHER" />
        </div>
      </div>
    </div>
  );
}

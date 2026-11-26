import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { SmartBoard } from '@/components/smartboard/SmartBoard';
import { UploadPanel } from '@/components/teacher/UploadPanel';
import { MaterialList } from '@/components/teacher/MaterialList';
import { Users, StopCircle } from 'lucide-react';
import Link from 'next/link';
import type { Material } from '@/types';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';

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
    <div className="classroom-layout" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 136px)' }}>
      {/* Top Bar */}
      <div
        className="clay clay-md classroom-topbar"
        style={{
          marginBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {classroom.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="clay-pill clay-pill-teal" style={{ fontSize: 12, padding: '4px 10px' }}>
              <Users size={13} />
              {classroom._count.enrollments} Enrolled
            </span>
            <span className="clay-pill" style={{ fontSize: 12, padding: '4px 10px' }}>
              Join Code: <strong style={{ letterSpacing: 1 }}>{classroom.code}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <PushNotificationToggle />
          <Link
            href="/teacher"
            className="clay-btn clay-btn-pink clay-btn-sm"
            style={{ height: 40, padding: '0 16px' }}
          >
            <StopCircle size={17} />
            End Session
          </Link>
        </div>
      </div>

      {/* Main Content: Sidebar + Board */}
      <div className="classroom-layout" style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div className="classroom-sidebar" style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 22, overflowY: 'auto', paddingRight: 6, paddingBottom: 12 }}>
          <UploadPanel classroomId={classroomId} />
          <MaterialList initialMaterials={classroom.materials as Material[]} classroomId={classroomId} />
        </div>

        {/* Board Area */}
        <div className="classroom-board" style={{ flex: 1, position: 'relative' }}>
          <SmartBoard classroomId={classroomId} role="TEACHER" />
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        classroomId={classroomId}
        currentUserId={session.user.id!}
        materials={classroom.materials.map((m) => ({ id: m.id, title: m.title, type: m.type }))}
      />
    </div>
  );
}

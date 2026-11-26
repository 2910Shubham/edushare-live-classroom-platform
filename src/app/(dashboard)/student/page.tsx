import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageBackground } from '@/components/ui/PageBackground';
import { StudentClassroomCard } from '@/components/student/ClassroomCard';
import { JoinClassroomButton } from '@/components/student/JoinClassroomButton';

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const userName = user.name?.split(' ')[0] || 'Student';

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      classroom: {
        include: {
          teacher: { select: { id: true, name: true, image: true } },
          _count: { select: { materials: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  const classrooms = enrollments.map((e) => e.classroom);

  return (
    <>
      <PageBackground variant="student" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div className="dashboard-header student-header" style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--clay-ink)',
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Welcome back, {userName} 🎒
            </h1>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 16 }}>
              Ready to learn something new today?
            </p>
          </div>
          <JoinClassroomButton />
        </div>

        {/* Classrooms */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your Enrolled Classes
          </h2>
        </div>

        {classrooms.length === 0 ? (
          <div className="clay clay-lg" style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div className="clay-icon clay-icon-teal" style={{ margin: '0 auto 20px', width: 72, height: 72, borderRadius: 24 }} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Join a classroom to start learning
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 15, maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Ask your teacher for a 6-character join code to access materials and live boards.
            </p>
            <JoinClassroomButton variant="empty" />
          </div>
        ) : (
          <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {classrooms.map((c) => (
              <StudentClassroomCard
                key={c.id}
                id={c.id}
                name={c.name}
                subject={c.subject}
                teacherName={c.teacher?.name || 'Teacher'}
                teacherImage={c.teacher?.image}
                materialCount={c._count.materials}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

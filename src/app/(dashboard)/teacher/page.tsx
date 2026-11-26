import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageBackground } from '@/components/ui/PageBackground';
import { TeacherClassroomCard } from '@/components/teacher/ClassroomCard';
import { CreateClassroomButton } from '@/components/teacher/CreateClassroomButton';

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const userName = user.name?.split(' ')[0] || 'Teacher';
  const role = (session.user as Record<string, unknown>).role as string;

  const classrooms = await db.classroom.findMany({
    where: role === 'ADMIN' ? {} : { teacherId: user.id },
    include: {
      _count: { select: { enrollments: true, materials: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalStudents = classrooms.reduce((acc, curr) => acc + curr._count.enrollments, 0);
  const totalMaterials = classrooms.reduce((acc, curr) => acc + curr._count.materials, 0);

  return (
    <>
      <PageBackground variant="teacher" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div className="dashboard-header" style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              Good morning, {userName} 👋
            </h1>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 16 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="clay clay-md" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="clay-icon clay-icon-purple" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Total Classrooms</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {classrooms.length}
              </p>
            </div>
          </div>
          <div className="clay clay-md" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="clay-icon clay-icon-teal" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Total Students</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totalStudents}
              </p>
            </div>
          </div>
          <div className="clay clay-md" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="clay-icon clay-icon-pink" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Materials Shared</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totalMaterials}
              </p>
            </div>
          </div>
        </div>

        {/* Classrooms */}
        <div className="section-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--clay-ink)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {role === 'ADMIN' ? 'All Classrooms' : 'Your Classrooms'}
          </h2>
          <CreateClassroomButton />
        </div>

        {classrooms.length === 0 ? (
          <div className="clay clay-lg" style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto 20px', width: 68, height: 68, borderRadius: 22 }} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No classrooms yet
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 15, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Create your first classroom to get started and share the join code with your students.
            </p>
            <CreateClassroomButton />
          </div>
        ) : (
          <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {classrooms.map((c) => (
              <TeacherClassroomCard
                key={c.id}
                id={c.id}
                name={c.name}
                subject={c.subject}
                code={c.code}
                studentCount={c._count.enrollments}
                materialCount={c._count.materials}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

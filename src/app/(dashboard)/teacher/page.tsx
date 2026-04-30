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
        <div className="dashboard-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#2D2B55',
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Good morning, {userName} 👋
            </h1>
            <p style={{ color: '#5A5880', fontSize: 16 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
          <div className="edu-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(108,99,255,0.1)', color: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p style={{ color: '#A8A6C8', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Total Classrooms</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {classrooms.length}
              </p>
            </div>
          </div>
          <div className="edu-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(67,232,216,0.1)', color: '#0CA89A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <p style={{ color: '#A8A6C8', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Total Students</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totalStudents}
              </p>
            </div>
          </div>
          <div className="edu-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,107,157,0.1)', color: '#FF6B9D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <p style={{ color: '#A8A6C8', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Materials Shared</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totalMaterials}
              </p>
            </div>
          </div>
        </div>

        {/* Classrooms */}
        <div className="section-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {role === 'ADMIN' ? 'All Classrooms' : 'Your Classrooms'}
          </h2>
          <CreateClassroomButton />
        </div>

        {classrooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 20, border: '1px dashed rgba(108,99,255,0.2)' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ margin: '0 auto 24px' }}>
              <rect x="20" y="30" width="80" height="56" rx="4" fill="rgba(108,99,255,0.1)" stroke="#6C63FF" strokeWidth="2" />
              <line x1="30" y1="86" x2="90" y2="86" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" />
              <polygon points="60,15 65,22 72,22 66,27 68,34 60,30 52,34 54,27 48,22 55,22" fill="#FFB347" />
              <circle cx="95" cy="20" r="4" fill="#43E8D8" />
              <circle cx="25" cy="15" r="3" fill="#FF6B9D" />
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No classrooms yet
            </h3>
            <p style={{ color: '#5A5880', fontSize: 15, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
              Create your first classroom to get started and share the join code with your students.
            </p>
            <CreateClassroomButton />
          </div>
        ) : (
          <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
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

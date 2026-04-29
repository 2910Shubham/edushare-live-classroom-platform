import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageBackground } from '@/components/ui/PageBackground';
import { StudentClassroomCard } from '@/components/student/ClassroomCard';

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
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Welcome back, {userName} 🎒
            </h1>
            <p style={{ color: '#5A5880', fontSize: 16 }}>
              Ready to learn something new today?
            </p>
          </div>
          <button className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 15 }}>
            <Plus size={18} />
            Join Classroom
          </button>
        </div>

        {/* Classrooms */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your Enrolled Classes
          </h2>
        </div>

        {classrooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#FFFFFF', borderRadius: 20, border: '1px dashed rgba(67,232,216,0.3)' }}>
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" style={{ margin: '0 auto 24px' }}>
              <rect x="30" y="70" width="80" height="16" rx="4" fill="rgba(67,232,216,0.1)" stroke="#43E8D8" strokeWidth="2" />
              <rect x="35" y="50" width="70" height="16" rx="4" fill="rgba(108,99,255,0.1)" stroke="#6C63FF" strokeWidth="2" />
              <rect x="40" y="30" width="60" height="16" rx="4" fill="rgba(255,107,157,0.1)" stroke="#FF6B9D" strokeWidth="2" />
              <path d="M50 30 V20 Q50 15 55 15 H85 Q90 15 90 20 V30" fill="none" stroke="#FFB347" strokeWidth="2" />
              <circle cx="110" cy="30" r="4" fill="#43E8D8" />
              <circle cx="30" cy="20" r="3" fill="#6C63FF" />
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Join a classroom to start learning
            </h3>
            <p style={{ color: '#5A5880', fontSize: 15, marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
              Ask your teacher for a 6-character join code to access materials and live boards.
            </p>
            <button className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} />
              Join Classroom
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
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

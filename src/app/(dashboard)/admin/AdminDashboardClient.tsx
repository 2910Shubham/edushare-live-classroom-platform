'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Teacher = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export function AdminDashboardClient({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const [teachers, setTeachers] = useState(initialTeachers);

  const handleAction = async (id: string, approve: boolean) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, approve }),
      });

      if (!res.ok) throw new Error('Action failed');

      setTeachers((prev) => prev.filter((t) => t.id !== id));
      toast.success(`Teacher ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

  return (
    <div className="edu-card" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2D2B55', marginBottom: 16 }}>Pending Teacher Approvals</h2>
      
      {teachers.length === 0 ? (
        <p style={{ color: '#5A5880' }}>No pending teachers at the moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {teachers.map((teacher) => (
            <div key={teacher.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#F8F7FF', borderRadius: 12, border: '1px solid rgba(108, 99, 255, 0.1)' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#2D2B55', marginBottom: 4 }}>{teacher.name}</p>
                <p style={{ color: '#5A5880', fontSize: 14 }}>{teacher.email}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleAction(teacher.id, true)}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 14 }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(teacher.id, false)}
                  style={{ padding: '8px 16px', fontSize: 14, background: '#FFF0F3', color: '#FF4757', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

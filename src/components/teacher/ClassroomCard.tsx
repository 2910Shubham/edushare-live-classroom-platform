'use client';

import Link from 'next/link';
import { Users, Copy, BookOpen, Monitor } from 'lucide-react';
import { toast } from 'sonner';

interface ClassroomCardProps {
  id: string;
  name: string;
  subject?: string | null;
  code: string;
  studentCount: number;
  materialCount: number;
}

function getSubjectColor(subject?: string | null) {
  if (!subject) return '#6C63FF';
  const hash = subject.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = ['#6C63FF', '#FF6B9D', '#43E8D8', '#FFB347', '#8B5CF6', '#36D5C5'];
  return colors[hash % colors.length];
}

export function TeacherClassroomCard({
  id,
  name,
  subject,
  code,
  studentCount,
  materialCount,
}: ClassroomCardProps) {
  const accentColor = getSubjectColor(subject);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  };

  return (
    <div
      className="edu-card"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#2D2B55',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 8,
          }}
        >
          {name}
        </h3>
        {subject && <span className="badge-subject">{subject}</span>}
      </div>

      {/* Join Code */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(108,99,255,0.04)',
          borderRadius: 10,
          padding: '8px 12px',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 600,
            color: '#6C63FF',
            letterSpacing: 2,
          }}
        >
          {code}
        </span>
        <button
          onClick={copyCode}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            color: '#A8A6C8',
            transition: 'color 0.2s',
          }}
          title="Copy code"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#6C63FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#A8A6C8'; }}
        >
          <Copy size={16} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5A5880', fontSize: 14 }}>
          <Users size={16} />
          {studentCount} student{studentCount !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5A5880', fontSize: 14 }}>
          <BookOpen size={16} />
          {materialCount} material{materialCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link
          href={`/teacher/classroom/${id}`}
          className="btn-primary"
          style={{
            flex: 1,
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Monitor size={16} />
          Open Board
        </Link>
      </div>
    </div>
  );
}

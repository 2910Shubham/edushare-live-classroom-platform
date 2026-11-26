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
  if (!subject) return 'var(--clay-purple)';
  const hash = subject.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = ['#7c6cff', '#ff8fc4', '#14a99a', '#f4b740', '#8b7dff', '#3fe0cf'];
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
      className="clay clay-md clay-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: accentColor,
        }}
      />
      <div style={{ paddingTop: 4 }}>
        <h3
          style={{
            fontSize: 19,
            fontWeight: 700,
            color: 'var(--clay-ink)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            marginBottom: 8,
          }}
        >
          {name}
        </h3>
        {subject && <span className="clay-pill clay-pill-yellow">{subject}</span>}
      </div>

      {/* Join Code */}
      <div
        className="clay-inset"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 14px',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--clay-purple-dark)',
            letterSpacing: 2,
          }}
        >
          {code}
        </span>
        <button
          type="button"
          onClick={copyCode}
          aria-label="Copy join code"
          style={{
            background: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            width: 32,
            height: 32,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--clay-purple-dark)',
            boxShadow: '0 2px 6px rgba(124, 108, 255, 0.16)',
            transition: 'transform 0.15s ease',
          }}
          title="Copy code"
        >
          <Copy size={15} />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clay-ink-soft)', fontSize: 14, fontWeight: 500 }}>
          <Users size={16} />
          {studentCount} student{studentCount !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clay-ink-soft)', fontSize: 14, fontWeight: 500 }}>
          <BookOpen size={16} />
          {materialCount} material{materialCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link
          href={`/teacher/classroom/${id}`}
          className="clay-btn clay-btn-sm"
          style={{ flex: 1 }}
        >
          <Monitor size={16} />
          Open Board
        </Link>
      </div>
    </div>
  );
}

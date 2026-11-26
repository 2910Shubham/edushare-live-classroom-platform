'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface StudentClassroomCardProps {
  id: string;
  name: string;
  subject?: string | null;
  teacherName: string;
  teacherImage?: string | null;
  materialCount: number;
}

export function StudentClassroomCard({
  id,
  name,
  subject,
  teacherName,
  teacherImage,
  materialCount,
}: StudentClassroomCardProps) {
  return (
    <div
      className="clay clay-md clay-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div>
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

      {/* Teacher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {teacherImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teacherImage}
            alt={teacherName}
            className="clay-avatar-ring"
            style={{ width: 32, height: 32, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="clay-icon clay-icon-sm clay-icon-purple"
            style={{ width: 32, height: 32, borderRadius: '50%', fontWeight: 700, fontSize: 13 }}
          >
            {teacherName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: 14, color: 'var(--clay-ink-soft)', fontWeight: 500 }}>{teacherName}</span>
      </div>

      {/* Material count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clay-ink-soft)', fontSize: 14, fontWeight: 500 }}>
        <BookOpen size={16} />
        {materialCount} material{materialCount !== 1 ? 's' : ''}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link
          href={`/student/classroom/${id}`}
          className="clay-btn clay-btn-teal clay-btn-sm"
          style={{ flex: 1 }}
        >
          <BookOpen size={16} />
          View Class
        </Link>
      </div>
    </div>
  );
}

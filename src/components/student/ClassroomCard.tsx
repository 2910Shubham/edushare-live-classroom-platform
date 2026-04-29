'use client';

import Link from 'next/link';
import { BookOpen, Monitor, FileText } from 'lucide-react';

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
      className="edu-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
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

      {/* Teacher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {teacherImage ? (
          <img
            src={teacherImage}
            alt={teacherName}
            style={{ width: 28, height: 28, borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(108,99,255,0.1)',
              color: '#6C63FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {teacherName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: 14, color: '#5A5880' }}>{teacherName}</span>
      </div>

      {/* Material count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5A5880', fontSize: 14 }}>
        <BookOpen size={16} />
        {materialCount} material{materialCount !== 1 ? 's' : ''}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Link
          href={`/student/smartboard/${id}`}
          className="btn-accent"
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
          Go to Board
        </Link>
        <Link
          href="/student/library"
          className="btn-secondary"
          style={{
            textDecoration: 'none',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <FileText size={16} />
          Notes
        </Link>
      </div>
    </div>
  );
}

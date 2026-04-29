'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.replace('/login');
      return;
    }

    const pendingRole = localStorage.getItem('edushare_pending_role');

    if (pendingRole && (pendingRole === 'TEACHER' || pendingRole === 'STUDENT')) {
      fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: pendingRole }),
      })
        .then((res) => res.json())
        .then(() => {
          localStorage.removeItem('edushare_pending_role');
          router.replace(pendingRole === 'TEACHER' ? '/teacher' : '/student');
        })
        .catch(() => {
          router.replace('/student');
        });
    } else {
      const role = (session.user as Record<string, unknown>).role as string;
      router.replace(role === 'TEACHER' ? '/teacher' : '/student');
    }
  }, [session, status, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F7FF',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(108,99,255,0.2)',
            borderTopColor: '#6C63FF',
            borderRadius: '50%',
            animation: 'spin-slow 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#5A5880', fontFamily: "'Inter', sans-serif" }}>
          Setting up your account...
        </p>
      </div>
    </div>
  );
}

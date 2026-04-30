'use client';

import { PageBackground } from '@/components/ui/PageBackground';
import { signOut } from 'next-auth/react';

export function PendingApprovalClient() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <PageBackground variant="auth" />
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="edu-card" style={{ maxWidth: 400, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>Pending Approval</h1>
          <p style={{ color: '#5A5880', lineHeight: 1.6, marginBottom: 24 }}>
            Your account has been created successfully. Please wait while an administrator reviews and approves your access.
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ width: '100%', marginBottom: 12 }}>
            Check Status
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#6C63FF', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { PageBackground } from '@/components/ui/PageBackground';
import { signOut } from 'next-auth/react';

export function PendingApprovalClient() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <PageBackground variant="auth" />
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="clay clay-lg clay-modal" style={{ maxWidth: 420, width: '100%', padding: '38px 30px', textAlign: 'center' }}>
          <div className="clay-icon clay-icon-purple" style={{ borderRadius: '50%', margin: '0 auto 24px' }} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 14 }}>Pending Approval</h1>
          <p style={{ color: 'var(--clay-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
            Your account has been created successfully. Please wait while an administrator reviews and approves your access.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="clay-btn" style={{ width: '100%', marginBottom: 12 }}>
            Check Status
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="clay-btn clay-btn-ghost clay-btn-sm"
            style={{ width: '100%' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

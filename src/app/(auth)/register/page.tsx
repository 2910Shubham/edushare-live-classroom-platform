'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { PageBackground } from '@/components/ui/PageBackground';

function RegisterContent() {
  const searchParams = useSearchParams();
  const presetRole = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'STUDENT' | null>(
    presetRole === 'teacher' ? 'TEACHER' : presetRole === 'student' ? 'STUDENT' : null
  );
  const [mode, setMode] = useState<'select' | 'form'>('select');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    if (selectedRole) {
      document.cookie = `edushare_pending_role=${selectedRole};path=/;max-age=600`;
      signIn('google', { callbackUrl: '/auth-redirect' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registration succeeded but login failed. Please sign in manually.');
        setLoading(false);
      } else {
        window.location.href = '/auth-redirect';
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    fontSize: 15,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <PageBackground variant="auth" />

      <div
        className="clay clay-lg clay-modal"
        style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(28px, 5vw, 44px) clamp(22px, 5vw, 38px)',
          maxWidth: 540,
          width: '100%',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <div className="clay-icon clay-icon-sm clay-icon-purple" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M8 24V8l10 8-10 8z" fill="white" />
              <path d="M16 24V8l10 8-10 8z" fill="white" opacity="0.65" />
            </svg>
          </div>
          <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--clay-ink)' }}>
            EduShare
          </span>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--clay-ink-soft)', fontSize: 16, marginBottom: 28 }}>
          Join the future of learning 🚀
        </p>

        {/* Step 1: Role Selection */}
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          I am a...
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 16, marginBottom: 24 }}>
          {/* Teacher Card */}
          <button
            type="button"
            onClick={() => { setSelectedRole('TEACHER'); setMode('select'); }}
            className="clay clay-md clay-hover"
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              background: selectedRole === 'TEACHER' ? '#f6f3ff' : 'var(--clay-surface)',
              boxShadow: selectedRole === 'TEACHER'
                ? '12px 16px 32px rgba(124,108,255,.24), inset -6px -6px 12px rgba(124,108,255,.12), inset 6px 6px 12px rgba(255,255,255,.95), 0 0 0 3px var(--clay-purple)'
                : undefined,
            }}
          >
            {selectedRole === 'TEACHER' && (
              <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: 'var(--clay-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            )}
            <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto 12px' }} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--clay-ink)', fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Teacher</p>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13, marginTop: 4 }}>Create &amp; manage classes</p>
          </button>

          {/* Student Card */}
          <button
            type="button"
            onClick={() => { setSelectedRole('STUDENT'); setMode('select'); }}
            className="clay clay-md clay-hover"
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              background: selectedRole === 'STUDENT' ? '#edfcf9' : 'var(--clay-surface)',
              boxShadow: selectedRole === 'STUDENT'
                ? '12px 16px 32px rgba(20,169,154,.22), inset -6px -6px 12px rgba(63,224,207,.14), inset 6px 6px 12px rgba(255,255,255,.95), 0 0 0 3px var(--clay-teal-dark)'
                : undefined,
            }}
          >
            {selectedRole === 'STUDENT' && (
              <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: '50%', background: 'var(--clay-teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            )}
            <div className="clay-icon clay-icon-teal" style={{ margin: '0 auto 12px' }} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--clay-ink)', fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Student</p>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13, marginTop: 4 }}>Join &amp; learn together</p>
          </button>
        </div>

        {selectedRole && mode === 'select' && (
          <div style={{ display: 'grid', gap: 14, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setMode('form')}
              className="clay-btn"
              style={{ width: '100%' }}
            >
              Register with Email &amp; Password
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(124, 108, 255, 0.16)' }} />
              <span style={{ color: 'var(--clay-ink-soft)', fontSize: 13, fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(124, 108, 255, 0.16)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="clay-btn clay-btn-ghost"
              style={{ width: '100%' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {selectedRole && mode === 'form' && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="register-name"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="clay-inset"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="register-email"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="clay-inset"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="register-password"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="clay-inset"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="clay-error" style={{ marginBottom: 16, textAlign: 'center' }} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="clay-btn"
              style={{ width: '100%', marginBottom: 12 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setMode('select')}
              className="clay-btn clay-btn-ghost clay-btn-sm"
              style={{ width: '100%' }}
            >
              ← Back to options
            </button>
          </form>
        )}

        {!selectedRole && (
          <p style={{ textAlign: 'center', color: 'var(--clay-ink-soft)', fontSize: 14 }}>
            Select your role above to continue
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 20, borderTop: '1px solid rgba(124, 108, 255, 0.12)' }}>
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--clay-purple-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--clay-purple-dark)', fontSize: 16, fontFamily: "'Inter', sans-serif" }}>Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

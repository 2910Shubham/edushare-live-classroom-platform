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
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(108, 99, 255, 0.15)',
    background: '#FAFAFE',
    fontSize: 15,
    color: '#2D2B55',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box' as const,
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <PageBackground variant="auth" />

      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 1,
        }}
      />

      <div
        className="animate-scaleIn"
        style={{
          position: 'relative',
          zIndex: 10,
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 8px 40px rgba(108, 99, 255, 0.12)',
          border: '1px solid rgba(108, 99, 255, 0.08)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6C63FF" />
            <path d="M8 22V10l8 6-8 6z" fill="white" />
            <path d="M16 22V10l8 6-8 6z" fill="white" opacity="0.6" />
          </svg>
          <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6C63FF' }}>
            EduShare
          </span>
        </div>

        <p style={{ textAlign: 'center', color: '#5A5880', fontSize: 16, marginBottom: 32 }}>
          Join the future of learning 🚀
        </p>

        {/* Step 1: Role Selection */}
        <p style={{ fontSize: 14, fontWeight: 600, color: '#2D2B55', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          I am a...
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* Teacher Card */}
          <button
            onClick={() => { setSelectedRole('TEACHER'); setMode('select'); }}
            style={{
              padding: 24, borderRadius: 16,
              border: `2px solid ${selectedRole === 'TEACHER' ? '#6C63FF' : 'rgba(108,99,255,0.1)'}`,
              background: selectedRole === 'TEACHER' ? 'rgba(108,99,255,0.04)' : '#FFFFFF',
              cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center', position: 'relative',
            }}
          >
            {selectedRole === 'TEACHER' && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            )}
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 12px' }}>
              <rect x="4" y="6" width="40" height="28" rx="4" fill="rgba(108,99,255,0.1)" stroke="#6C63FF" strokeWidth="2" />
              <line x1="12" y1="18" x2="28" y2="18" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="24" x2="22" y2="24" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="34" x2="20" y2="42" stroke="#6C63FF" strokeWidth="2" />
              <line x1="28" y1="34" x2="28" y2="42" stroke="#6C63FF" strokeWidth="2" />
              <line x1="14" y1="42" x2="34" y2="42" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontWeight: 600, color: '#2D2B55', fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Teacher</p>
            <p style={{ color: '#A8A6C8', fontSize: 12, marginTop: 4 }}>Create & manage classes</p>
          </button>

          {/* Student Card */}
          <button
            onClick={() => { setSelectedRole('STUDENT'); setMode('select'); }}
            style={{
              padding: 24, borderRadius: 16,
              border: `2px solid ${selectedRole === 'STUDENT' ? '#43E8D8' : 'rgba(67,232,216,0.15)'}`,
              background: selectedRole === 'STUDENT' ? 'rgba(67,232,216,0.04)' : '#FFFFFF',
              cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center', position: 'relative',
            }}
          >
            {selectedRole === 'STUDENT' && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: '#43E8D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            )}
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 12px' }}>
              <path d="M8 8h12a4 4 0 0 1 4 4v28a3 3 0 0 0-3-3H8V8z" fill="rgba(67,232,216,0.1)" stroke="#43E8D8" strokeWidth="2" />
              <path d="M40 8H28a4 4 0 0 0-4 4v28a3 3 0 0 1 3-3h13V8z" fill="rgba(67,232,216,0.1)" stroke="#43E8D8" strokeWidth="2" />
              <line x1="13" y1="16" x2="19" y2="16" stroke="#43E8D8" strokeWidth="2" strokeLinecap="round" />
              <line x1="13" y1="22" x2="18" y2="22" stroke="#43E8D8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p style={{ fontWeight: 600, color: '#2D2B55', fontSize: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Student</p>
            <p style={{ color: '#A8A6C8', fontSize: 12, marginTop: 4 }}>Join & learn together</p>
          </button>
        </div>

        {selectedRole && mode === 'select' && (
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => setMode('form')}
              className="btn-primary"
              style={{ width: '100%', padding: '13px 24px', fontSize: 15 }}
            >
              Register with Email & Password
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(108, 99, 255, 0.1)' }} />
              <span style={{ color: '#A8A6C8', fontSize: 13 }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(108, 99, 255, 0.1)' }} />
            </div>

            <button
              onClick={handleGoogleSignIn}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '13px 24px', borderRadius: 14,
                border: '1px solid rgba(108, 99, 255, 0.15)',
                background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
                cursor: 'pointer', fontSize: 15, fontWeight: 500, color: '#2D2B55',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(108, 99, 255, 0.08)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
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
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#2D2B55', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.15)'; }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#2D2B55', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.15)'; }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#2D2B55', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108, 99, 255, 0.15)'; }}
              />
            </div>

            {error && (
              <p style={{ color: '#FF4757', fontSize: 13, marginBottom: 14, textAlign: 'center', background: '#FFF0F3', padding: '8px 12px', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px 24px', fontSize: 15, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setMode('select')}
              style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#6C63FF', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
            >
              ← Back to options
            </button>
          </form>
        )}

        {!selectedRole && (
          <p style={{ textAlign: 'center', color: '#A8A6C8', fontSize: 14 }}>
            Select your role above to continue
          </p>
        )}

        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(108, 99, 255, 0.08)' }}>
          <p style={{ color: '#5A5880', fontSize: 14 }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#6C63FF', fontWeight: 500, textDecoration: 'none' }}>
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
        <div style={{ color: '#6C63FF', fontSize: 16, fontFamily: "'Inter', sans-serif" }}>Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

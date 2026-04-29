'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { PageBackground } from '@/components/ui/PageBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      window.location.href = '/auth-redirect';
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

      {/* Glow effect behind card */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
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
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 40px rgba(108, 99, 255, 0.12)',
          border: '1px solid rgba(108, 99, 255, 0.08)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6C63FF" />
            <path d="M8 22V10l8 6-8 6z" fill="white" />
            <path d="M16 22V10l8 6-8 6z" fill="white" opacity="0.6" />
          </svg>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#6C63FF',
            }}
          >
            EduShare
          </span>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#5A5880',
            fontSize: 16,
            marginBottom: 32,
          }}
        >
          Where classrooms come alive ✨
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleCredentialLogin} style={{ marginBottom: 20 }}>
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
              placeholder="••••••••"
              required
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
            style={{
              width: '100%',
              padding: '13px 24px',
              fontSize: 15,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(108, 99, 255, 0.1)' }} />
          <span style={{ color: '#A8A6C8', fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(108, 99, 255, 0.1)' }} />
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/auth-redirect' })}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '13px 24px',
            borderRadius: 14,
            border: '1px solid rgba(108, 99, 255, 0.15)',
            background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: 500,
            color: '#2D2B55',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(108, 99, 255, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(108, 99, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(108, 99, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
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

        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(108, 99, 255, 0.08)',
          }}
        >
          <p style={{ color: '#5A5880', fontSize: 14 }}>
            New here?{' '}
            <a
              href="/register"
              style={{
                color: '#6C63FF',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

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
          maxWidth: 440,
          width: '100%',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div className="clay-icon clay-icon-sm clay-icon-purple" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M8 24V8l10 8-10 8z" fill="white" />
              <path d="M16 24V8l10 8-10 8z" fill="white" opacity="0.65" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--clay-ink)',
            }}
          >
            EduShare
          </span>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--clay-ink-soft)',
            fontSize: 16,
            marginBottom: 28,
          }}
        >
          Where classrooms come alive ✨
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleCredentialLogin} style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--clay-ink)',
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Email
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--clay-ink)',
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(124, 108, 255, 0.16)' }} />
          <span style={{ color: 'var(--clay-ink-soft)', fontSize: 13, fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(124, 108, 255, 0.16)' }} />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/auth-redirect' })}
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

        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(124, 108, 255, 0.12)',
          }}
        >
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14 }}>
            New here?{' '}
            <a
              href="/register"
              style={{
                color: 'var(--clay-purple-dark)',
                fontWeight: 600,
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

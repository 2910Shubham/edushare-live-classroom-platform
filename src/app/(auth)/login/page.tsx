'use client';

import { signIn } from 'next-auth/react';
import { PageBackground } from '@/components/ui/PageBackground';

export default function LoginPage() {
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polygon
              points="10,1 12.5,7 19,7.5 14,12 15.5,18.5 10,15 4.5,18.5 6,12 1,7.5 7.5,7"
              fill="#FFB347"
              opacity="0.8"
            />
          </svg>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#5A5880',
            fontSize: 16,
            marginBottom: 36,
          }}
        >
          Where classrooms come alive ✨
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/api/auth/redirect' })}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 24px',
            borderRadius: 14,
            border: '1px solid rgba(108, 99, 255, 0.15)',
            background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
            cursor: 'pointer',
            fontSize: 16,
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
          {/* Google Logo SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p
          style={{
            textAlign: 'center',
            color: '#A8A6C8',
            fontSize: 12,
            marginTop: 24,
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our Terms of Service
        </p>

        <div
          style={{
            textAlign: 'center',
            marginTop: 20,
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

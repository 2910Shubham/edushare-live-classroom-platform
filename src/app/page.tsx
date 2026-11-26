import Link from 'next/link';
import { PageBackground } from '@/components/ui/PageBackground';

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'clip' }}>
      <PageBackground variant="auth" />

      {/* Sticky Floating Clay Navbar */}
      <div
        style={{
          position: 'sticky',
          top: 16,
          zIndex: 30,
          padding: '0 16px',
          maxWidth: 1200,
          margin: '16px auto 0',
        }}
      >
        <nav
          className="clay"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px clamp(14px, 3vw, 24px)',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="clay-icon clay-icon-sm clay-icon-purple" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M8 24V8l10 8-10 8z" fill="white" />
                <path d="M16 24V8l10 8-10 8z" fill="white" opacity="0.65" />
              </svg>
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--clay-ink)',
              }}
            >
              EduShare
            </span>
          </div>
          <div style={{ display: 'flex', flexShrink: 0 }}>
            <Link
              href="/register"
              className="clay-btn clay-btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: 'clamp(48px, 8vw, 84px) 20px 56px',
          maxWidth: 920,
          margin: '0 auto',
        }}
      >
        <div className="clay-pill" style={{ marginBottom: 24 }}>
          ✨ Now with AI-Powered Study Notes
        </div>
        <h1
          style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, var(--clay-purple-dark) 0%, #c9327a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Classroom
          </span>
          <br />
          <span style={{ color: 'var(--clay-ink)' }}>of the Future, Today</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'var(--clay-ink-soft)',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Share materials, annotate live, and let AI generate study notes — all in real time.
          EduShare brings your classroom to life.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register?role=teacher" className="clay-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            I&apos;m a Teacher
          </Link>
          <Link href="/register?role=student" className="clay-btn clay-btn-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            I&apos;m a Student
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '56px 20px',
          maxWidth: 1120,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(26px, 3.5vw, 34px)',
            fontWeight: 700,
            marginBottom: 44,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'var(--clay-ink)',
          }}
        >
          Everything you need for{' '}
          <span style={{ color: 'var(--clay-purple-dark)' }}>modern teaching</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {/* Feature 1 */}
          <div className="clay clay-lg clay-hover" style={{ textAlign: 'center' }}>
            <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto 20px' }} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 10,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--clay-ink)',
              }}
            >
              Live Smart Board
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', lineHeight: 1.65, fontSize: 15 }}>
              Share PDFs, images, and slides on a real-time board. Every student sees exactly what you
              see — instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="clay clay-lg clay-hover" style={{ textAlign: 'center' }}>
            <div className="clay-icon clay-icon-teal" style={{ margin: '0 auto 20px' }} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 10,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--clay-ink)',
              }}
            >
              AI-Powered Notes
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', lineHeight: 1.65, fontSize: 15 }}>
              Gemini AI automatically generates structured study notes from every material shared.
              Students can edit and personalize them.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="clay clay-lg clay-hover" style={{ textAlign: 'center' }}>
            <div className="clay-icon clay-icon-pink" style={{ margin: '0 auto 20px' }} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 10,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--clay-ink)',
              }}
            >
              Real-time Annotations
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', lineHeight: 1.65, fontSize: 15 }}>
              Teachers draw, highlight, and annotate directly on shared content. Every stroke appears
              live on every student&apos;s screen.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '56px 20px 80px',
          maxWidth: 960,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(26px, 3.5vw, 34px)',
            fontWeight: 700,
            marginBottom: 44,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: 'var(--clay-ink)',
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          <div className="clay clay-md">
            <div
              className="clay-icon clay-icon-purple"
              style={{
                borderRadius: '50%',
                margin: '0 auto 16px',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              1
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--clay-ink)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Create a Classroom
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
              Teachers create a classroom and share the unique 6-character join code with students.
            </p>
          </div>

          <div className="clay clay-md">
            <div
              className="clay-icon clay-icon-teal"
              style={{
                borderRadius: '50%',
                margin: '0 auto 16px',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              2
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--clay-ink)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Share Materials
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
              Upload PDFs, images, and slides. They instantly appear on every student&apos;s smart board.
            </p>
          </div>

          <div className="clay clay-md">
            <div
              className="clay-icon clay-icon-yellow"
              style={{
                borderRadius: '50%',
                margin: '0 auto 16px',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              3
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--clay-ink)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Learn Together
            </h3>
            <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14, lineHeight: 1.6 }}>
              Annotate live, get AI notes, and collaborate in real time. Learning has never been this engaging.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '28px 20px',
          borderTop: '1px solid rgba(124, 108, 255, 0.12)',
          color: 'var(--clay-ink-soft)',
          fontSize: 14,
        }}
      >
        Made with ❤️ for education &middot; EduShare © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { PageBackground } from '@/components/ui/PageBackground';

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <PageBackground variant="auth" />

      {/* Nav */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#6C63FF" />
            <path d="M8 22V10l8 6-8 6z" fill="white" />
            <path d="M16 22V10l8 6-8 6z" fill="white" opacity="0.6" />
          </svg>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#2D2B55',
            }}
          >
            EduShare
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="/login"
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              fontWeight: 500,
              color: '#6C63FF',
              background: 'rgba(108, 99, 255, 0.08)',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              textDecoration: 'none',
              fontSize: 15,
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: 15 }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '80px 24px 60px',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 999,
            background: 'rgba(108, 99, 255, 0.08)',
            color: '#6C63FF',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 24,
          }}
        >
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
              background: 'linear-gradient(135deg, #6C63FF 0%, #FF6B9D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The Classroom
          </span>
          <br />
          <span style={{ color: '#2D2B55' }}>of the Future, Today</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#5A5880',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Share materials, annotate live, and let AI generate study notes — all in real time.
          EduShare brings your classroom to life.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register?role=teacher"
            className="btn-primary"
            style={{
              textDecoration: 'none',
              fontSize: 16,
              padding: '14px 32px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            I&apos;m a Teacher
          </Link>
          <Link
            href="/register?role=student"
            className="btn-accent"
            style={{
              textDecoration: 'none',
              fontSize: 16,
              padding: '14px 32px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          padding: '60px 24px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 48,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#2D2B55',
          }}
        >
          Everything you need for{' '}
          <span style={{ color: '#6C63FF' }}>modern teaching</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {/* Feature 1 */}
          <div className="edu-card" style={{ textAlign: 'center', padding: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#2D2B55',
              }}
            >
              Live Smart Board
            </h3>
            <p style={{ color: '#5A5880', lineHeight: 1.6, fontSize: 15 }}>
              Share PDFs, images, and slides on a real-time board. Every student sees exactly what you
              see — instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="edu-card" style={{ textAlign: 'center', padding: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(67,232,216,0.1) 0%, rgba(54,213,197,0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#43E8D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#2D2B55',
              }}
            >
              AI-Powered Notes
            </h3>
            <p style={{ color: '#5A5880', lineHeight: 1.6, fontSize: 15 }}>
              Gemini AI automatically generates structured study notes from every material shared.
              Students can edit and personalize them.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="edu-card" style={{ textAlign: 'center', padding: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(255,71,87,0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B9D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#2D2B55',
              }}
            >
              Real-time Annotations
            </h3>
            <p style={{ color: '#5A5880', lineHeight: 1.6, fontSize: 15 }}>
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
          padding: '60px 24px 80px',
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 48,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#2D2B55',
          }}
        >
          How it works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}
        >
          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                color: '#2D2B55',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Create a Classroom
            </h3>
            <p style={{ color: '#5A5880', fontSize: 14, lineHeight: 1.6 }}>
              Teachers create a classroom and share the unique 6-character join code with students.
            </p>
          </div>

          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #43E8D8 0%, #36D5C5 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                color: '#2D2B55',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Share Materials
            </h3>
            <p style={{ color: '#5A5880', fontSize: 14, lineHeight: 1.6 }}>
              Upload PDFs, images, and slides. They instantly appear on every student&apos;s smart board.
            </p>
          </div>

          <div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B9D 0%, #FF4757 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                color: '#2D2B55',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Learn Together
            </h3>
            <p style={{ color: '#5A5880', fontSize: 14, lineHeight: 1.6 }}>
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
          padding: '24px',
          borderTop: '1px solid rgba(108, 99, 255, 0.08)',
          color: '#A8A6C8',
          fontSize: 14,
        }}
      >
        Made with ❤️ for education &middot; EduShare © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

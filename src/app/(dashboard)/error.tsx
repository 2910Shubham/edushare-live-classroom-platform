'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 24,
      }}
    >
      {/* Friendly error illustration */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 24 }}>
        <circle cx="60" cy="60" r="56" fill="rgba(255,107,157,0.08)" stroke="#FF6B9D" strokeWidth="2" />
        <circle cx="42" cy="50" r="4" fill="#FF6B9D" />
        <circle cx="78" cy="50" r="4" fill="#FF6B9D" />
        <path d="M40 78 Q60 65 80 78" stroke="#FF6B9D" strokeWidth="3" strokeLinecap="round" fill="none" />
        <text x="60" y="100" textAnchor="middle" fontSize="12" fill="#A8A6C8">oops!</text>
      </svg>

      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#2D2B55',
          marginBottom: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          color: '#5A5880',
          fontSize: 15,
          marginBottom: 24,
          maxWidth: 400,
        }}
      >
        Don&apos;t worry, this happens sometimes. Let&apos;s try that again.
      </p>
      <p style={{ color: '#A8A6C8', fontSize: 12, marginBottom: 24, fontFamily: 'monospace' }}>
        {error.message}
      </p>
      <button onClick={reset} className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
        Try Again
      </button>
    </div>
  );
}

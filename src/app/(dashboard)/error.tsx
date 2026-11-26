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
      <div className="clay clay-lg" style={{ maxWidth: 460, width: '100%' }}>
        <div className="clay-icon clay-icon-pink" style={{ borderRadius: '50%', width: 72, height: 72, margin: '0 auto 20px' }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--clay-ink)',
            marginBottom: 8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            color: 'var(--clay-ink-soft)',
            fontSize: 15,
            marginBottom: 20,
          }}
        >
          Don&apos;t worry, this happens sometimes. Let&apos;s try that again.
        </p>
        <p className="clay-inset" style={{ color: 'var(--clay-ink-soft)', fontSize: 12, marginBottom: 24, fontFamily: 'monospace', padding: '10px 12px' }}>
          {error.message}
        </p>
        <button type="button" onClick={reset} className="clay-btn">
          Try Again
        </button>
      </div>
    </div>
  );
}

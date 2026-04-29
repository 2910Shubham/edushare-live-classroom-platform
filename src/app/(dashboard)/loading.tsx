export default function DashboardLoading() {
  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      {/* Header shimmer */}
      <div className="shimmer" style={{ width: 280, height: 36, marginBottom: 8 }} />
      <div className="shimmer" style={{ width: 180, height: 20, marginBottom: 32 }} />

      {/* Stats row shimmer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              border: '1px solid rgba(108,99,255,0.08)',
            }}
          >
            <div className="shimmer" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: 80, height: 14, marginBottom: 8 }} />
            <div className="shimmer" style={{ width: 48, height: 28 }} />
          </div>
        ))}
      </div>

      {/* Cards grid shimmer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              border: '1px solid rgba(108,99,255,0.08)',
            }}
          >
            <div className="shimmer" style={{ width: '70%', height: 20, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: '50%', height: 14, marginBottom: 16 }} />
            <div className="shimmer" style={{ width: '100%', height: 40, borderRadius: 12 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

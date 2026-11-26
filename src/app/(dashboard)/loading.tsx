export default function DashboardLoading() {
  return (
    <div className="animate-fadeInUp">
      {/* Header shimmer */}
      <div className="shimmer" style={{ width: 260, height: 36, marginBottom: 10 }} />
      <div className="shimmer" style={{ width: 180, height: 20, marginBottom: 32 }} />

      {/* Stats row shimmer */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="clay clay-md">
            <div className="shimmer" style={{ width: 44, height: 44, borderRadius: 14, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: 90, height: 14, marginBottom: 8 }} />
            <div className="shimmer" style={{ width: 52, height: 28 }} />
          </div>
        ))}
      </div>

      {/* Cards grid shimmer */}
      <div className="classroom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="clay clay-md">
            <div className="shimmer" style={{ width: '70%', height: 20, marginBottom: 12 }} />
            <div className="shimmer" style={{ width: '50%', height: 14, marginBottom: 16 }} />
            <div className="shimmer" style={{ width: '100%', height: 44, borderRadius: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

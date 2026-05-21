'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  MousePointerClick,
  Users,
  Monitor,
  RefreshCw,
} from 'lucide-react';

type Stats = {
  periodDays: number;
  totalUsers: number;
  activeUsersNow: number;
  activeOnBoardNow: number;
  uniqueUsersInPeriod: number;
  totalSessions: number;
  totalEvents: number;
  avgSessionDurationSec: number;
  totalTimeSpentSec: number;
  avgTimePerUserSec: number;
  sessionsByRole: { role: string; count: number }[];
  topEvents: { action: string; count: number }[];
  topFeatures: { action: string; count: number }[];
  topButtons: { action: string; count: number }[];
  boardStats: { classroomId: string; classroomName: string; uniqueUsers: number; totalTimeSec: number }[];
  topUsersByTime: { userId: string; name: string; email: string; role: string; totalSec: number; avgSec: number }[];
  dailyActiveUsers: { date: string; activeUsers: number }[];
};

function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="edu-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        border: `1px solid ${accent}22`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#5A5880' }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${accent}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#2D2B55', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#A8A6C8' }}>{sub}</div>}
    </div>
  );
}

function RankList({
  title,
  items,
  empty,
}: {
  title: string;
  items: { action: string; count: number }[];
  empty: string;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="edu-card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: '#A8A6C8', fontSize: 14 }}>{empty}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div key={item.action}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#2D2B55',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.action.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#6C63FF', flexShrink: 0 }}>{item.count}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(108,99,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round((item.count / max) * 100)}%`,
                    background: 'linear-gradient(90deg, #6C63FF, #43E8D8)',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminAnalyticsClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics/stats?days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !stats) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#5A5880' }}>
        Loading analytics…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="edu-card" style={{ padding: 24, color: '#FF4757' }}>
        {error}
        <p style={{ marginTop: 8, fontSize: 13, color: '#5A5880' }}>
          Run <code>npx prisma db push</code> if you haven&apos;t applied the analytics tables yet.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  const maxDaily = Math.max(1, ...stats.dailyActiveUsers.map((d) => d.activeUsers));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#2D2B55',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 4,
            }}
          >
            Analytics
          </h1>
          <p style={{ color: '#5A5880', fontSize: 14 }}>Usage, time on platform, and feature engagement (admin only)</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid rgba(108,99,255,0.2)',
              fontSize: 14,
              fontWeight: 600,
              color: '#2D2B55',
            }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Active now"
          value={stats.activeUsersNow}
          sub="Last 5 minutes"
          icon={<Activity size={18} />}
          accent="#43E8D8"
        />
        <StatCard
          label="On board now"
          value={stats.activeOnBoardNow}
          sub="In a classroom session"
          icon={<Monitor size={18} />}
          accent="#6C63FF"
        />
        <StatCard
          label="Users (period)"
          value={stats.uniqueUsersInPeriod}
          sub={`of ${stats.totalUsers} total accounts`}
          icon={<Users size={18} />}
          accent="#FF6B9D"
        />
        <StatCard
          label="Avg session time"
          value={formatDuration(stats.avgSessionDurationSec)}
          sub={`${stats.totalSessions} sessions`}
          icon={<Clock size={18} />}
          accent="#FFB347"
        />
        <StatCard
          label="Avg time per user"
          value={formatDuration(stats.avgTimePerUserSec)}
          sub={`Total ${formatDuration(stats.totalTimeSpentSec)}`}
          icon={<BarChart3 size={18} />}
          accent="#6C63FF"
        />
        <StatCard
          label="Events tracked"
          value={stats.totalEvents}
          sub="Clicks & features"
          icon={<MousePointerClick size={18} />}
          accent="#43E8D8"
        />
      </div>

      <div className="edu-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>Daily active users (7 days)</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {stats.dailyActiveUsers.map((d) => (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 48,
                  height: `${Math.max(8, (d.activeUsers / maxDaily) * 100)}%`,
                  minHeight: 8,
                  background: 'linear-gradient(180deg, #6C63FF, #43E8D8)',
                  borderRadius: '6px 6px 0 0',
                }}
                title={`${d.activeUsers} users`}
              />
              <span style={{ fontSize: 10, color: '#A8A6C8', fontWeight: 600 }}>
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <RankList title="Top features used" items={stats.topFeatures} empty="No feature events yet" />
        <RankList title="Top buttons clicked" items={stats.topButtons} empty="No button events yet" />
        <RankList title="All top actions" items={stats.topEvents} empty="No events yet" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <div className="edu-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>Sessions by role</h3>
          {stats.sessionsByRole.map((r) => (
            <div
              key={r.role}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(108,99,255,0.08)',
                fontSize: 14,
              }}
            >
              <span style={{ fontWeight: 600, color: '#2D2B55' }}>{r.role}</span>
              <span style={{ fontWeight: 800, color: '#6C63FF' }}>{r.count}</span>
            </div>
          ))}
        </div>

        <div className="edu-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>Time on board by classroom</h3>
          {stats.boardStats.length === 0 ? (
            <p style={{ color: '#A8A6C8', fontSize: 14 }}>No classroom board time yet</p>
          ) : (
            stats.boardStats.map((b) => (
              <div
                key={b.classroomId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(108,99,255,0.08)',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2B55', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.classroomName}
                  </div>
                  <div style={{ fontSize: 12, color: '#A8A6C8' }}>{b.uniqueUsers} users</div>
                </div>
                <span style={{ fontWeight: 800, color: '#6C63FF', flexShrink: 0 }}>
                  {formatDuration(b.totalTimeSec)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="edu-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D2B55', marginBottom: 16 }}>Most engaged users</h3>
          {stats.topUsersByTime.map((u) => (
            <div
              key={u.userId}
              style={{
                padding: '10px 0',
                borderBottom: '1px solid rgba(108,99,255,0.08)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: '#2D2B55' }}>{u.name}</div>
              <div style={{ fontSize: 12, color: '#A8A6C8', marginBottom: 4 }}>
                {u.role} · {u.email}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6C63FF' }}>
                {formatDuration(u.totalSec)} total · avg {formatDuration(u.avgSec)}/session
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

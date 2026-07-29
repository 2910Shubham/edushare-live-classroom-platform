'use client';

import type { QuizTeam } from '@/types/quiz';

interface QuizScoreboardProps {
  teams: QuizTeam[];
  activeTeamId?: string;
  title?: string;
  highlightWinners?: boolean;
}

export function QuizScoreboard({
  teams,
  activeTeamId,
  title = 'Scoreboard',
  highlightWinners = false,
}: QuizScoreboardProps) {
  const rankedTeams = [...teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const topScore = rankedTeams[0]?.score ?? 0;
  const winnerIds = new Set(
    highlightWinners && topScore > 0
      ? rankedTeams.filter((team) => team.score === topScore).map((team) => team.id)
      : []
  );

  return (
    <div className="edu-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2D2B55', marginBottom: 6 }}>
            {title}
          </h2>
          <p style={{ color: '#A8A6C8', fontSize: 14 }}>
            {highlightWinners ? 'Final standings' : 'Live points for each team'}
          </p>
        </div>
        <div className="badge-teacher">
          {teams.length} Teams
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {rankedTeams.map((team, index) => {
          const isActive = team.id === activeTeamId;
          const isWinner = winnerIds.has(team.id);

          return (
            <div
              key={team.id}
              style={{
                borderRadius: 18,
                padding: isWinner ? '18px 20px' : '16px 18px',
                background: isWinner
                  ? 'linear-gradient(135deg, rgba(255,179,71,0.18) 0%, rgba(108,99,255,0.1) 100%)'
                  : isActive
                    ? 'rgba(108, 99, 255, 0.08)'
                    : '#FAFAFE',
                border: isWinner
                  ? '2px solid rgba(255, 179, 71, 0.7)'
                  : isActive
                    ? '1px solid rgba(108, 99, 255, 0.24)'
                    : '1px solid rgba(108, 99, 255, 0.08)',
                boxShadow: isWinner ? '0 8px 24px rgba(255, 179, 71, 0.22)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: isWinner
                      ? 'linear-gradient(135deg, #FFB347 0%, #FF8C42 100%)'
                      : isActive
                        ? '#6C63FF'
                        : 'rgba(108, 99, 255, 0.12)',
                    color: isWinner || isActive ? '#FFFFFF' : '#6C63FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {isWinner ? '★' : index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <p style={{ fontSize: isWinner ? 18 : 16, fontWeight: 700, color: '#2D2B55', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {team.name}
                    </p>
                    {isWinner && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #FFB347 0%, #FF8C42 100%)',
                          color: '#FFFFFF',
                          borderRadius: 999,
                          padding: '3px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Winner
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: isWinner ? '#C47A00' : isActive ? '#6C63FF' : '#A8A6C8',
                      fontWeight: 500,
                    }}
                  >
                    {isWinner ? 'Champion of the quiz' : isActive ? 'Current turn' : 'Waiting'}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p
                  style={{
                    fontSize: isWinner ? 32 : 28,
                    fontWeight: 700,
                    color: isWinner ? '#C47A00' : '#2D2B55',
                    lineHeight: 1,
                  }}
                >
                  {team.score}
                </p>
                <p style={{ fontSize: 12, color: '#A8A6C8', marginTop: 4 }}>
                  points
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

interface QuizSetupProps {
  teamCount: 2 | 4 | 5;
  timerDuration: number;
  teamNames: string[];
  questionCount: number;
  onTeamCountChange: (count: 2 | 4 | 5) => void;
  onTimerDurationChange: (duration: number) => void;
  onTeamNameChange: (index: number, value: string) => void;
  onStart: () => void;
}

const TEAM_OPTIONS = [2, 4, 5] as const;
const TIMER_OPTIONS = [30, 45, 60] as const;

export function QuizSetup({
  teamCount,
  timerDuration,
  teamNames,
  questionCount,
  onTeamCountChange,
  onTimerDurationChange,
  onTeamNameChange,
  onStart,
}: QuizSetupProps) {
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(108, 99, 255, 0.15)',
    background: '#FAFAFE',
    fontSize: 15,
    color: '#2D2B55',
    outline: 'none',
  } as const;

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section className="edu-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700, color: '#2D2B55', marginBottom: 10 }}>
              Teacher Quiz Host
            </h1>
            <p style={{ fontSize: 16, color: '#5A5880', maxWidth: 760, lineHeight: 1.6 }}>
              Set up the teams, choose a timer, and start a live MCQ round. Questions rotate automatically so each team gets a turn in round-robin order.
            </p>
          </div>

          <div
            style={{
              minWidth: 220,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(67,232,216,0.08) 100%)',
              padding: 18,
              border: '1px solid rgba(108,99,255,0.12)',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: '#A8A6C8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quiz Pack
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#2D2B55', lineHeight: 1 }}>
              {questionCount}
            </p>
            <p style={{ fontSize: 14, color: '#5A5880', marginTop: 8 }}>
              dummy questions ready to use
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2D2B55', marginBottom: 14 }}>
              Number of teams
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {TEAM_OPTIONS.map((count) => {
                const selected = teamCount === count;

                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onTeamCountChange(count)}
                    className={selected ? 'btn-primary' : 'btn-secondary'}
                    style={{ minWidth: 86, padding: '12px 18px', fontSize: 15 }}
                  >
                    {count} Teams
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#2D2B55', marginBottom: 14 }}>
              Time per question
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {TIMER_OPTIONS.map((seconds) => {
                const selected = timerDuration === seconds;

                return (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => onTimerDurationChange(seconds)}
                    className={selected ? 'btn-primary' : 'btn-secondary'}
                    style={{ minWidth: 86, padding: '12px 18px', fontSize: 15 }}
                  >
                    {seconds}s
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="edu-card" style={{ padding: 32 }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2D2B55', marginBottom: 8 }}>
            Team names
          </h2>
          <p style={{ color: '#5A5880', fontSize: 15 }}>
            Edit the team labels if you want something better than Team 1, Team 2, and so on.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {teamNames.map((teamName, index) => (
            <div key={index}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#2D2B55', marginBottom: 8 }}>
                Team {index + 1}
              </label>
              <input
                value={teamName}
                onChange={(e) => onTeamNameChange(index, e.target.value)}
                placeholder={`Team ${index + 1}`}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 28 }}>
          <p style={{ color: '#A8A6C8', fontSize: 14 }}>
            The quiz will assign questions automatically in round-robin order.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="btn-primary"
            style={{ padding: '14px 24px', fontSize: 16 }}
          >
            Start Quiz
          </button>
        </div>
      </section>
    </div>
  );
}

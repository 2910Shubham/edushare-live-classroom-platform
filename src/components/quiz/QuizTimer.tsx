'use client';

interface QuizTimerProps {
  timeLeft: number;
  duration: number;
  progress: number;
  isRunning: boolean;
}

export function QuizTimer({ timeLeft, duration, progress, isRunning }: QuizTimerProps) {
  const isCritical = timeLeft <= 10;
  const strokeColor = isCritical ? '#FF4757' : '#6C63FF';

  return (
    <div className="edu-card" style={{ padding: 20, textAlign: 'center' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#A8A6C8', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Question Timer
      </p>

      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(108, 99, 255, 0.12)" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r="56"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={351.86}
            strokeDashoffset={351.86 - (351.86 * progress) / 100}
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.2s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: strokeColor,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1,
            }}
          >
            {timeLeft}
          </span>
          <span style={{ fontSize: 13, color: '#A8A6C8', marginTop: 6 }}>
            / {duration}s
          </span>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 999,
          overflow: 'hidden',
          background: 'rgba(108, 99, 255, 0.08)',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${strokeColor} 0%, ${isCritical ? '#FF6B9D' : '#8B5CF6'} 100%)`,
            transition: 'width 1s linear',
          }}
        />
      </div>

      <p style={{ fontSize: 14, color: isRunning ? '#5A5880' : '#A8A6C8', fontWeight: 500 }}>
        {isRunning ? 'Timer is running' : timeLeft === 0 ? "Time's up" : 'Timer is paused'}
      </p>
    </div>
  );
}

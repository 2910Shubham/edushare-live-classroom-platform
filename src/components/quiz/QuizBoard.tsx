'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { QuizTimer } from './QuizTimer';

interface QuizBoardProps {
  question: QuizQuestion;
  currentQuestionNumber: number;
  totalQuestions: number;
  currentRound: number;
  totalRounds: number;
  currentTeamName: string;
  isAnswerRevealed: boolean;
  timerExpired: boolean;
  timeLeft: number;
  timerDuration: number;
  progress: number;
  isTimerRunning: boolean;
  onPauseResume: () => void;
  onRevealAnswer: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onPass: () => void;
}

export function QuizBoard({
  question,
  currentQuestionNumber,
  totalQuestions,
  currentRound,
  totalRounds,
  currentTeamName,
  isAnswerRevealed,
  timerExpired,
  timeLeft,
  timerDuration,
  progress,
  isTimerRunning,
  onPauseResume,
  onRevealAnswer,
  onCorrect,
  onWrong,
  onPass,
}: QuizBoardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [trackedQuestionId, setTrackedQuestionId] = useState(question.id);

  if (trackedQuestionId !== question.id) {
    setTrackedQuestionId(question.id);
    setSelectedIndex(null);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 0.9fr)', gap: 24 }}>
      <div className="edu-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <div className="badge-teacher" style={{ display: 'inline-flex' }}>
                Round {currentRound} of {totalRounds}
              </div>
              <div className="badge-subject" style={{ display: 'inline-flex' }}>
                Question {currentQuestionNumber} of {totalQuestions}
              </div>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', lineHeight: 1.25, marginBottom: 12 }}>
              {question.question}
            </h2>
            <p style={{ color: '#5A5880', fontSize: 16 }}>
              Turn: <span style={{ color: '#6C63FF', fontWeight: 700 }}>{currentTeamName}</span>
            </p>
          </div>

          <div
            style={{
              minWidth: 180,
              background: 'rgba(108,99,255,0.06)',
              borderRadius: 18,
              padding: 16,
              border: '1px solid rgba(108,99,255,0.14)',
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: '#A8A6C8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Current Team
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#6C63FF', lineHeight: 1.2 }}>
              {currentTeamName}
            </p>
          </div>
        </div>

        {timerExpired && (
          <div
            className="animate-shake"
            style={{
              borderRadius: 16,
              padding: '14px 16px',
              marginBottom: 22,
              background: 'rgba(255, 71, 87, 0.08)',
              color: '#FF4757',
              fontWeight: 600,
              border: '1px solid rgba(255, 71, 87, 0.18)',
            }}
          >
            Time&apos;s up. Mark the result as correct, wrong, or pass to continue.
          </div>
        )}

        <div style={{ display: 'grid', gap: 16 }}>
          {question.options.map((option, index) => {
            const isCorrect = question.correctIndex === index;
            const highlightAnswer = isAnswerRevealed && isCorrect;
            const isSelected = selectedIndex === index;

            let border = '1px solid rgba(108, 99, 255, 0.12)';
            let background = '#FFFFFF';
            let badgeBackground = 'rgba(108, 99, 255, 0.1)';
            let badgeColor = '#6C63FF';
            let boxShadow = 'none';

            if (highlightAnswer) {
              border = '2px solid rgba(67, 232, 216, 0.7)';
              background = 'linear-gradient(135deg, rgba(67,232,216,0.14) 0%, rgba(108,99,255,0.08) 100%)';
              badgeBackground = '#43E8D8';
              badgeColor = '#FFFFFF';
            } else if (isSelected) {
              border = '2px solid #6C63FF';
              background = 'rgba(108, 99, 255, 0.1)';
              badgeBackground = '#6C63FF';
              badgeColor = '#FFFFFF';
              boxShadow = '0 0 0 4px rgba(108, 99, 255, 0.16)';
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                style={{
                  borderRadius: 18,
                  padding: '18px 20px',
                  border,
                  background,
                  boxShadow,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: badgeBackground,
                    color: badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 18, color: '#2D2B55', fontWeight: 600, lineHeight: 1.5 }}>
                    {option}
                  </p>
                  {highlightAnswer && (
                    <p style={{ fontSize: 13, color: '#0CA89A', marginTop: 6, fontWeight: 600 }}>
                      Correct answer
                    </p>
                  )}
                  {!highlightAnswer && isSelected && (
                    <p style={{ fontSize: 13, color: '#6C63FF', marginTop: 6, fontWeight: 600 }}>
                      Selected
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
          <button
            type="button"
            onClick={onPauseResume}
            className="btn-secondary"
            style={{ padding: '12px 18px', fontSize: 15 }}
          >
            {isTimerRunning ? 'Pause Timer' : timeLeft === 0 ? 'Timer Ended' : 'Resume Timer'}
          </button>
          <button
            type="button"
            onClick={onRevealAnswer}
            className="btn-secondary"
            style={{ padding: '12px 18px', fontSize: 15 }}
          >
            {isAnswerRevealed ? 'Answer Revealed' : 'Reveal Answer'}
          </button>
          <button
            type="button"
            onClick={onCorrect}
            className="btn-accent"
            style={{ padding: '12px 18px', fontSize: 15 }}
          >
            Correct
          </button>
          <button
            type="button"
            onClick={onWrong}
            className="btn-danger"
            style={{ padding: '12px 18px', fontSize: 15 }}
          >
            Wrong
          </button>
          <button
            type="button"
            onClick={onPass}
            className="btn-primary"
            style={{ padding: '12px 18px', fontSize: 15 }}
          >
            Pass
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
        <QuizTimer
          timeLeft={timeLeft}
          duration={timerDuration}
          progress={progress}
          isRunning={isTimerRunning}
        />

        <div className="edu-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2D2B55', marginBottom: 12 }}>
            Host controls
          </h3>
          <div style={{ display: 'grid', gap: 10, color: '#5A5880', fontSize: 15, lineHeight: 1.6 }}>
            <p>Use <strong>Correct</strong> to award one point and move to the next question.</p>
            <p>Use <strong>Wrong</strong> if the team answers incorrectly.</p>
            <p>Use <strong>Pass</strong> when the team skips or cannot answer.</p>
            <p>Reveal the answer any time without affecting the score.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

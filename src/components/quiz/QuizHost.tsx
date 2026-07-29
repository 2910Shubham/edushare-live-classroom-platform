'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageBackground } from '@/components/ui/PageBackground';
import { QUIZ_QUESTIONS } from '@/lib/quiz/questions';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import type { QuizPhase, QuizTeam } from '@/types/quiz';
import { QuizBoard } from './QuizBoard';
import { QuizScoreboard } from './QuizScoreboard';
import { QuizSetup } from './QuizSetup';

function buildTeams(teamCount: 2 | 4 | 5, teamNames?: string[]): QuizTeam[] {
  return Array.from({ length: teamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: teamNames?.[index]?.trim() || `Team ${index + 1}`,
    score: 0,
  }));
}

function getWinnerNames(teams: QuizTeam[]) {
  if (teams.length === 0) {
    return [];
  }

  const topScore = Math.max(...teams.map((team) => team.score));
  if (topScore <= 0) {
    return [];
  }

  return teams.filter((team) => team.score === topScore).map((team) => team.name);
}

export function QuizHost() {
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [teamCount, setTeamCount] = useState<2 | 4 | 5>(2);
  const [timerDuration, setTimerDuration] = useState(30);
  const [teamNames, setTeamNames] = useState<string[]>(['Team 1', 'Team 2']);
  const [teams, setTeams] = useState<QuizTeam[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [completedRound, setCompletedRound] = useState(0);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [timeExpiredQuestions, setTimeExpiredQuestions] = useState<Record<string, boolean>>({});

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];
  const activeTeamCount = teams.length || teamCount;
  const currentTeam = teams.length > 0 ? teams[questionIndex % teams.length] : null;
  const currentRound = Math.floor(questionIndex / activeTeamCount) + 1;
  const totalRounds = Math.ceil(QUIZ_QUESTIONS.length / activeTeamCount);
  const questionKey = currentQuestion?.id ?? 'setup';
  const isAnswerRevealed = Boolean(revealedQuestions[questionKey]);
  const timerExpired = Boolean(timeExpiredQuestions[questionKey]);
  const winnerNames = useMemo(() => getWinnerNames(teams), [teams]);

  const handleExpire = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    setTimeExpiredQuestions((current) => ({ ...current, [currentQuestion.id]: true }));
  }, [currentQuestion]);

  const { timeLeft, isRunning, progress, start, pause, restart, reset } = useQuizTimer({
    duration: timerDuration,
    onExpire: handleExpire,
  });

  const syncTeamNames = useCallback((count: 2 | 4 | 5) => {
    setTeamNames((current) =>
      Array.from({ length: count }, (_, index) => current[index] || `Team ${index + 1}`)
    );
  }, []);

  const handleTeamCountChange = useCallback(
    (count: 2 | 4 | 5) => {
      setTeamCount(count);
      syncTeamNames(count);
    },
    [syncTeamNames]
  );

  const handleTeamNameChange = useCallback((index: number, value: string) => {
    setTeamNames((current) =>
      current.map((name, currentIndex) => (currentIndex === index ? value : name))
    );
  }, []);

  const startQuiz = useCallback(() => {
    const preparedTeams = buildTeams(teamCount, teamNames);
    setTeams(preparedTeams);
    setQuestionIndex(0);
    setCompletedRound(0);
    setRevealedQuestions({});
    setTimeExpiredQuestions({});
    setPhase('playing');
    restart(timerDuration);
  }, [restart, teamCount, teamNames, timerDuration]);

  const finishQuiz = useCallback(() => {
    setPhase('finished');
    reset(timerDuration);
  }, [reset, timerDuration]);

  const goToNextQuestion = useCallback(() => {
    const nextIndex = questionIndex + 1;
    const roundJustPlayed = Math.floor(questionIndex / teams.length) + 1;

    if (nextIndex >= QUIZ_QUESTIONS.length) {
      setCompletedRound(roundJustPlayed);
      finishQuiz();
      return;
    }

    // A round ends once every team has answered one question
    if (nextIndex % teams.length === 0) {
      setQuestionIndex(nextIndex);
      setCompletedRound(nextIndex / teams.length);
      setPhase('roundBreak');
      reset(timerDuration);
      return;
    }

    setQuestionIndex(nextIndex);
  }, [finishQuiz, questionIndex, reset, teams.length, timerDuration]);

  const continueToNextRound = useCallback(() => {
    setPhase('playing');
    restart(timerDuration);
  }, [restart, timerDuration]);

  const handleCorrect = useCallback(() => {
    if (!currentTeam) {
      return;
    }

    setTeams((current) =>
      current.map((team) =>
        team.id === currentTeam.id ? { ...team, score: team.score + 1 } : team
      )
    );
    goToNextQuestion();
  }, [currentTeam, goToNextQuestion]);

  const handleWrong = useCallback(() => {
    goToNextQuestion();
  }, [goToNextQuestion]);

  const handlePass = useCallback(() => {
    goToNextQuestion();
  }, [goToNextQuestion]);

  const revealAnswer = useCallback(() => {
    if (!currentQuestion) {
      return;
    }

    setRevealedQuestions((current) => ({ ...current, [currentQuestion.id]: true }));
  }, [currentQuestion]);

  const resetToSetup = useCallback(() => {
    setPhase('setup');
    setQuestionIndex(0);
    setCompletedRound(0);
    setTeams([]);
    setRevealedQuestions({});
    setTimeExpiredQuestions({});
    setTeamCount(2);
    setTimerDuration(30);
    setTeamNames(['Team 1', 'Team 2']);
    reset(30);
  }, [reset]);

  const toggleTimer = useCallback(() => {
    if (timeLeft === 0) {
      return;
    }

    if (isRunning) {
      pause();
      return;
    }

    start();
  }, [isRunning, pause, start, timeLeft]);

  const headerDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  useEffect(() => {
    if (phase === 'playing' && currentQuestion) {
      restart(timerDuration);
    }
  }, [currentQuestion, phase, restart, timerDuration]);

  const hasMoreRounds = questionIndex < QUIZ_QUESTIONS.length;

  return (
    <>
      <PageBackground variant="teacher" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div className="dashboard-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#2D2B55',
                marginBottom: 8,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Quiz Arena
            </h1>
            <p style={{ color: '#5A5880', fontSize: 16 }}>
              {headerDate}
              {phase !== 'setup' && teams.length > 0 && (
                <span style={{ color: '#A8A6C8' }}>
                  {' '}· Round {phase === 'roundBreak' ? completedRound : currentRound} of {totalRounds}
                </span>
              )}
            </p>
          </div>

          {phase !== 'setup' && (
            <button
              type="button"
              onClick={resetToSetup}
              className="btn-secondary"
              style={{ padding: '12px 18px', fontSize: 15 }}
            >
              Reset Quiz
            </button>
          )}
        </div>

        {phase === 'setup' && (
          <QuizSetup
            teamCount={teamCount}
            timerDuration={timerDuration}
            teamNames={teamNames}
            questionCount={QUIZ_QUESTIONS.length}
            onTeamCountChange={handleTeamCountChange}
            onTimerDurationChange={setTimerDuration}
            onTeamNameChange={handleTeamNameChange}
            onStart={startQuiz}
          />
        )}

        {phase === 'playing' && currentQuestion && currentTeam && (
          <div style={{ display: 'grid', gap: 24 }}>
            <QuizBoard
              question={currentQuestion}
              currentQuestionNumber={questionIndex + 1}
              totalQuestions={QUIZ_QUESTIONS.length}
              currentRound={currentRound}
              totalRounds={totalRounds}
              currentTeamName={currentTeam.name}
              isAnswerRevealed={isAnswerRevealed}
              timerExpired={timerExpired}
              timeLeft={timeLeft}
              timerDuration={timerDuration}
              progress={progress}
              isTimerRunning={isRunning}
              onPauseResume={toggleTimer}
              onRevealAnswer={revealAnswer}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
              onPass={handlePass}
            />

            <QuizScoreboard teams={teams} activeTeamId={currentTeam.id} />
          </div>
        )}

        {phase === 'roundBreak' && (
          <div style={{ display: 'grid', gap: 24 }}>
            <section className="edu-card" style={{ padding: 32, textAlign: 'center' }}>
              <div className="badge-teacher" style={{ display: 'inline-flex', marginBottom: 16 }}>
                Round {completedRound} complete
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', marginBottom: 10 }}>
                Every team has had a turn
              </h2>
              <p style={{ fontSize: 16, color: '#5A5880', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
                Round {completedRound} is finished. You can end the quiz now and crown the winner, or continue into Round {completedRound + 1} starting again from Team 1.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={finishQuiz}
                  className="btn-danger"
                  style={{ padding: '14px 24px', fontSize: 16 }}
                >
                  End Quiz
                </button>
                {hasMoreRounds && (
                  <button
                    type="button"
                    onClick={continueToNextRound}
                    className="btn-primary"
                    style={{ padding: '14px 24px', fontSize: 16 }}
                  >
                    Continue to Round {completedRound + 1}
                  </button>
                )}
              </div>
            </section>

            <QuizScoreboard
              teams={teams}
              title={`Scores after Round ${completedRound}`}
            />
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ display: 'grid', gap: 24 }}>
            <section className="edu-card" style={{ padding: 32, textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, rgba(255,179,71,0.2) 0%, rgba(108,99,255,0.12) 100%)',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                }}
              >
                🏆
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: '#2D2B55', marginBottom: 10 }}>
                Quiz complete
              </h2>
              <p style={{ fontSize: 16, color: '#5A5880', maxWidth: 620, margin: '0 auto 12px', lineHeight: 1.6 }}>
                {winnerNames.length === 0
                  ? 'No points were scored this quiz.'
                  : winnerNames.length === 1
                    ? `${winnerNames[0]} wins the quiz!`
                    : `It's a tie between ${winnerNames.join(' and ')}!`}
              </p>
              <p style={{ fontSize: 14, color: '#A8A6C8', marginBottom: 24 }}>
                Completed after Round {completedRound || currentRound}
              </p>
              <button
                type="button"
                onClick={resetToSetup}
                className="btn-primary"
                style={{ padding: '14px 24px', fontSize: 16 }}
              >
                Play Again
              </button>
            </section>

            <QuizScoreboard teams={teams} title="Final Scores" highlightWinners />
          </div>
        )}
      </div>
    </>
  );
}

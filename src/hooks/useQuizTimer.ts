'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseQuizTimerOptions {
  duration: number;
  autoStart?: boolean;
  onExpire?: () => void;
}

export function useQuizTimer({ duration, autoStart = false, onExpire }: UseQuizTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            setIsRunning(false);
            onExpire?.();
          }
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, onExpire, timeLeft]);

  const start = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (nextDuration?: number) => {
      expiredRef.current = false;
      setTimeLeft(nextDuration ?? duration);
      setIsRunning(false);
    },
    [duration]
  );

  const restart = useCallback(
    (nextDuration?: number) => {
      expiredRef.current = false;
      setTimeLeft(nextDuration ?? duration);
      setIsRunning(true);
    },
    [duration]
  );

  const progress = useMemo(() => {
    if (duration <= 0) {
      return 0;
    }

    return (timeLeft / duration) * 100;
  }, [duration, timeLeft]);

  return {
    timeLeft,
    isRunning,
    progress,
    isExpired: timeLeft === 0,
    start,
    pause,
    reset,
    restart,
  };
}

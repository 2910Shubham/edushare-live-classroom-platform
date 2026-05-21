'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { setAnalyticsSessionId, trackEvent } from '@/lib/analytics';

const HEARTBEAT_MS = 30_000;

function parseClassroomId(path: string): string | undefined {
  const m = path.match(/\/classroom\/([^/]+)/);
  return m?.[1];
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const sessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string | null>(null);

  const endSession = useCallback(() => {
    const id = sessionIdRef.current;
    if (!id) return;

    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    fetch('/api/analytics/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, durationSec, end: true }),
      keepalive: true,
    }).catch(() => {});

    sessionIdRef.current = null;
    setAnalyticsSessionId(null);
  }, []);

  const startSession = useCallback(async (path: string) => {
    if (status !== 'authenticated' || !session?.user) return;

    endSession();

    try {
      const res = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json();
      if (res.ok && data.sessionId) {
        sessionIdRef.current = data.sessionId;
        setAnalyticsSessionId(data.sessionId);
        startedAtRef.current = Date.now();
        lastPathRef.current = path;

        const classroomId = parseClassroomId(path);
        const isBoard = path.includes('/classroom/');

        await trackEvent({
          category: 'page',
          action: 'page_view',
          label: path,
          classroomId,
          metadata: { isBoard },
        });

        if (isBoard && classroomId) {
          await trackEvent({
            category: 'board',
            action: 'board_enter',
            label: path,
            classroomId,
          });
        }
      }
    } catch {
      // ignore
    }
  }, [status, session?.user, endSession]);

  const heartbeat = useCallback(() => {
    const id = sessionIdRef.current;
    if (!id) return;
    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    fetch('/api/analytics/session', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, durationSec }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !pathname) return;
    if (lastPathRef.current === pathname && sessionIdRef.current) return;
    startSession(pathname);
  }, [pathname, status, startSession]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const interval = setInterval(heartbeat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [status, heartbeat]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') endSession();
    };
    const onUnload = () => endSession();

    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onUnload);
      endSession();
    };
  }, [endSession]);

  return <>{children}</>;
}

'use client';

export type AnalyticsCategory = 'page' | 'feature' | 'button' | 'board' | 'navigation';

export type TrackEventPayload = {
  category: AnalyticsCategory;
  action: string;
  label?: string;
  classroomId?: string;
  metadata?: Record<string, unknown>;
};

let currentSessionId: string | null = null;

export function getAnalyticsSessionId() {
  return currentSessionId;
}

export function setAnalyticsSessionId(id: string | null) {
  currentSessionId = id;
}

export async function trackEvent(payload: TrackEventPayload) {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        sessionId: currentSessionId,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      }),
      keepalive: true,
    });
  } catch {
    // Non-blocking
  }
}

export function trackButton(action: string, label?: string, extra?: Partial<TrackEventPayload>) {
  return trackEvent({
    category: 'button',
    action,
    label,
    ...extra,
  });
}

export function trackFeature(action: string, label?: string, extra?: Partial<TrackEventPayload>) {
  return trackEvent({
    category: 'feature',
    action,
    label,
    ...extra,
  });
}

export function trackBoard(action: string, classroomId?: string, label?: string) {
  return trackEvent({
    category: 'board',
    action,
    label,
    classroomId,
  });
}

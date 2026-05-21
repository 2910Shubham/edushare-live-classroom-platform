import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { resolveAnalyticsUser } from '@/lib/analytics-auth';

function parseClassroomId(path: string): string | null {
  const m = path.match(/\/classroom\/([^/]+)/);
  return m?.[1] ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = await resolveAnalyticsUser(session);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const path = body.path?.trim() || '/';
    const classroomId = parseClassroomId(path);

    const row = await db.analyticsSession.create({
      data: {
        userId: user.userId,
        role: user.role,
        path,
        classroomId,
        userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json({ sessionId: row.id });
  } catch (error) {
    console.error('Analytics session POST:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = await resolveAnalyticsUser(session);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      durationSec?: number;
      end?: boolean;
      path?: string;
    };

    if (!body.sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const existing = await db.analyticsSession.findFirst({
      where: { id: body.sessionId, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const durationSec =
      typeof body.durationSec === 'number'
        ? Math.max(0, Math.min(body.durationSec, 86400))
        : existing.durationSec;

    await db.analyticsSession.update({
      where: { id: body.sessionId },
      data: {
        durationSec,
        ...(body.path ? { path: body.path, classroomId: parseClassroomId(body.path) } : {}),
        ...(body.end ? { endedAt: new Date(), durationSec } : {}),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics session PATCH:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

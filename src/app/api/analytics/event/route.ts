import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { resolveAnalyticsUser } from '@/lib/analytics-auth';
import type { Prisma } from '@prisma/client';

function parseClassroomId(path: string | undefined): string | null {
  if (!path) return null;
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
    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      category?: string;
      action?: string;
      label?: string;
      path?: string;
      classroomId?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.action || !body.category) {
      return NextResponse.json({ error: 'category and action required' }, { status: 400 });
    }

    const path = body.path?.trim();
    const classroomId = body.classroomId ?? parseClassroomId(path);

    await db.analyticsEvent.create({
      data: {
        userId: user.userId,
        role: user.role,
        category: body.category.slice(0, 32),
        action: body.action.slice(0, 64),
        label: body.label?.slice(0, 128) ?? null,
        path: path?.slice(0, 256) ?? null,
        classroomId,
        sessionId: body.sessionId ?? null,
        metadata: body.metadata
          ? (JSON.parse(JSON.stringify(body.metadata)) as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics event POST:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}

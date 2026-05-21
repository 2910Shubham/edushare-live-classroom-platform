import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAdminAnalyticsStats } from '@/lib/analytics-server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as Record<string, unknown> | undefined)?.role;

    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get('days') ?? 30)));

    const stats = await getAdminAnalyticsStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics stats GET:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}

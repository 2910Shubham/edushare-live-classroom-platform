import { db } from '@/lib/db';
import type { Role } from '@prisma/client';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

function periodStart(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAdminAnalyticsStats(days = 30) {
  const since = periodStart(days);
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MS);

  const [
    totalUsers,
    sessionsInPeriod,
    eventsInPeriod,
    activeSessions,
    activeOnBoard,
    topEvents,
    topFeatures,
    topButtons,
    avgDuration,
    totalDuration,
    sessionsByRole,
    dailyActive,
  ] = await Promise.all([
    db.user.count(),
    db.analyticsSession.findMany({
      where: { startedAt: { gte: since } },
      select: {
        id: true,
        userId: true,
        role: true,
        path: true,
        classroomId: true,
        durationSec: true,
        startedAt: true,
        endedAt: true,
      },
    }),
    db.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { action: true, category: true, userId: true, createdAt: true },
    }),
    db.analyticsSession.findMany({
      where: {
        OR: [
          { endedAt: null, startedAt: { gte: activeSince } },
          { endedAt: { gte: activeSince } },
          { startedAt: { gte: activeSince } },
        ],
      },
      select: { userId: true, role: true, path: true, classroomId: true },
      distinct: ['userId'],
    }),
    db.analyticsSession.findMany({
      where: {
        classroomId: { not: null },
        OR: [
          { endedAt: null, startedAt: { gte: activeSince } },
          { endedAt: { gte: activeSince } },
          { startedAt: { gte: activeSince } },
        ],
      },
      select: { userId: true, classroomId: true, role: true },
      distinct: ['userId'],
    }),
    db.analyticsEvent.groupBy({
      by: ['action'],
      where: { createdAt: { gte: since } },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 15,
    }),
    db.analyticsEvent.groupBy({
      by: ['action'],
      where: { createdAt: { gte: since }, category: 'feature' },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 12,
    }),
    db.analyticsEvent.groupBy({
      by: ['action'],
      where: { createdAt: { gte: since }, category: 'button' },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 12,
    }),
    db.analyticsSession.aggregate({
      where: { startedAt: { gte: since }, durationSec: { gt: 0 } },
      _avg: { durationSec: true },
      _sum: { durationSec: true },
      _count: true,
    }),
    db.analyticsSession.aggregate({
      where: { startedAt: { gte: since } },
      _sum: { durationSec: true },
    }),
    db.analyticsSession.groupBy({
      by: ['role'],
      where: { startedAt: { gte: since } },
      _count: { id: true },
    }),
    db.analyticsSession.findMany({
      where: { startedAt: { gte: periodStart(7) } },
      select: { userId: true, startedAt: true },
    }),
  ]);

  const uniqueUsersInPeriod = new Set(sessionsInPeriod.map((s) => s.userId)).size;
  const uniqueEventUsers = new Set(eventsInPeriod.map((e) => e.userId)).size;

  const boardTimeByClassroom = new Map<string, { users: Set<string>; totalSec: number }>();
  for (const s of sessionsInPeriod) {
    if (!s.classroomId) continue;
    const entry = boardTimeByClassroom.get(s.classroomId) ?? {
      users: new Set<string>(),
      totalSec: 0,
    };
    entry.users.add(s.userId);
    entry.totalSec += s.durationSec;
    boardTimeByClassroom.set(s.classroomId, entry);
  }

  const boardStats = [...boardTimeByClassroom.entries()]
    .map(([classroomId, v]) => ({
      classroomId,
      uniqueUsers: v.users.size,
      totalTimeSec: v.totalSec,
    }))
    .sort((a, b) => b.totalTimeSec - a.totalTimeSec)
    .slice(0, 10);

  const classroomIds = boardStats.map((b) => b.classroomId);
  const classrooms =
    classroomIds.length > 0
      ? await db.classroom.findMany({
          where: { id: { in: classroomIds } },
          select: { id: true, name: true },
        })
      : [];
  const classroomNames = Object.fromEntries(classrooms.map((c) => [c.id, c.name]));

  const dailyMap = new Map<string, Set<string>>();
  for (const s of dailyActive) {
    const key = s.startedAt.toISOString().slice(0, 10);
    if (!dailyMap.has(key)) dailyMap.set(key, new Set());
    dailyMap.get(key)!.add(s.userId);
  }
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, activeUsers: dailyMap.get(key)?.size ?? 0 };
  });

  const perUserDuration = new Map<string, number>();
  for (const s of sessionsInPeriod) {
    perUserDuration.set(s.userId, (perUserDuration.get(s.userId) ?? 0) + s.durationSec);
  }
  const userTimeList = [...perUserDuration.entries()]
    .map(([userId, totalSec]) => ({ userId, totalSec }))
    .sort((a, b) => b.totalSec - a.totalSec)
    .slice(0, 10);

  const topUserIds = userTimeList.map((u) => u.userId);
  const topUsers =
    topUserIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, name: true, email: true, role: true },
        })
      : [];
  const userById = Object.fromEntries(topUsers.map((u) => [u.id, u]));

  return {
    periodDays: days,
    totalUsers,
    activeUsersNow: activeSessions.length,
    activeOnBoardNow: activeOnBoard.length,
    uniqueUsersInPeriod,
    uniqueEventUsers,
    totalSessions: sessionsInPeriod.length,
    totalEvents: eventsInPeriod.length,
    avgSessionDurationSec: Math.round(avgDuration._avg.durationSec ?? 0),
    totalTimeSpentSec: totalDuration._sum.durationSec ?? 0,
    avgTimePerUserSec:
      uniqueUsersInPeriod > 0
        ? Math.round((totalDuration._sum.durationSec ?? 0) / uniqueUsersInPeriod)
        : 0,
    sessionsByRole: sessionsByRole.map((r) => ({
      role: r.role as Role,
      count: r._count.id,
    })),
    topEvents: topEvents.map((e) => ({
      action: e.action,
      count: e._count.action,
    })),
    topFeatures: topFeatures.map((e) => ({
      action: e.action,
      count: e._count.action,
    })),
    topButtons: topButtons.map((e) => ({
      action: e.action,
      count: e._count.action,
    })),
    boardStats: boardStats.map((b) => ({
      ...b,
      classroomName: classroomNames[b.classroomId] ?? b.classroomId,
    })),
    topUsersByTime: userTimeList.map((u) => ({
      ...u,
      name: userById[u.userId]?.name ?? 'Unknown',
      email: userById[u.userId]?.email ?? '',
      role: userById[u.userId]?.role ?? 'STUDENT',
      avgSec: Math.round(u.totalSec / Math.max(1, sessionsInPeriod.filter((s) => s.userId === u.userId).length)),
    })),
    dailyActiveUsers: last7Days,
    activeUsersList: activeSessions.slice(0, 20).map((s) => ({
      userId: s.userId,
      role: s.role,
      path: s.path,
      classroomId: s.classroomId,
    })),
  };
}

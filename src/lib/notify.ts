import { db } from './db';
import { publishToRedis } from './redis';

export async function notifyStudents(
  classroomId: string,
  title: string,
  message: string,
  type: string
) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { classroomId },
      select: { userId: true },
    });

    const notifications = enrollments.map((e) => ({
      userId: e.userId,
      title,
      message,
      type,
    }));

    if (notifications.length > 0) {
      await db.notification.createMany({ data: notifications });
    }

    await publishToRedis('edushare:events', {
      room: `classroom:${classroomId}`,
      event: 'notification:new',
      payload: { title, message, type, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Failed to notify students:', error);
  }
}

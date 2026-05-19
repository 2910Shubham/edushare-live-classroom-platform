import webPush from 'web-push';
import { db } from './db';

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@edushare.app';

if (vapidPublicKey && vapidPrivateKey && vapidPublicKey !== 'your-vapid-public-key') {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Send push notifications to all subscribed members of a classroom
 * (enrolled students + the teacher), excluding the sender.
 */
export async function sendPushToClassroom(
  classroomId: string,
  senderId: string,
  payload: PushPayload
) {
  try {
    // Get the classroom teacher
    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
      select: { teacherId: true },
    });

    // Get all enrolled student IDs
    const enrollments = await db.enrollment.findMany({
      where: { classroomId },
      select: { userId: true },
    });

    // Combine teacher + student IDs, exclude sender
    const memberIds = [
      ...(classroom ? [classroom.teacherId] : []),
      ...enrollments.map((e) => e.userId),
    ].filter((id) => id !== senderId);

    if (memberIds.length === 0) return;

    // Get push subscriptions for these users
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: { in: memberIds } },
    });

    if (subscriptions.length === 0) return;

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      data: {
        url: payload.url || '/',
        tag: payload.tag || 'edushare',
      },
    });

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSub = JSON.parse(sub.subscription);
          await webPush.sendNotification(pushSub, pushPayload);
        } catch (err: any) {
          // If subscription is expired/invalid, remove it
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
          throw err;
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`Push sent to ${successful}/${subscriptions.length} subscribers for classroom ${classroomId}`);
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

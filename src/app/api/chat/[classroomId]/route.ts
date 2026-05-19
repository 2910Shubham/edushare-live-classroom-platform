import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { publishToRedis } from '@/lib/redis';
import { sendPushToClassroom } from '@/lib/push';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '120 s'),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  materialId: z.string().optional(),
  type: z.enum(['text', 'doubt', 'material_share']).default('text'),
});

/**
 * GET /api/chat/[classroomId] — Fetch messages for a classroom
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classroomId } = await params;

    // Verify user has access to this classroom
    const hasAccess = await verifyClassroomAccess(session.user.id, classroomId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pagination with cursor
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const take = Math.min(parseInt(searchParams.get('take') || '50'), 100);

    const messages = await db.chatMessage.findMany({
      where: { classroomId },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
        material: {
          select: { id: true, title: true, type: true, fileUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // Fetch one extra to determine if there are more
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = messages.length > take;
    const data = hasMore ? messages.slice(0, take) : messages;

    return NextResponse.json({
      messages: data.reverse(), // Return oldest-first
      nextCursor: hasMore ? data[0]?.id : null,
    });
  } catch (error) {
    console.error('GET chat messages error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/chat/[classroomId] — Send a new message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classroomId } = await params;

    // Verify user has access to this classroom
    const hasAccess = await verifyClassroomAccess(session.user.id, classroomId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch user role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Rate limiting for students: max 5 messages per 2 minutes
    if (user?.role === 'STUDENT') {
      const identifier = `chat_ratelimit:${classroomId}:${session.user.id}`;
      const { success, limit, remaining, reset } = await chatRateLimit.limit(identifier);
      
      if (!success) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. You can only send 5 messages every 2 minutes. Please wait.' 
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        });
      }
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Create message
    const message = await db.chatMessage.create({
      data: {
        classroomId,
        userId: session.user.id,
        content: parsed.data.content,
        materialId: parsed.data.materialId || null,
        type: parsed.data.type,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
        material: {
          select: { id: true, title: true, type: true, fileUrl: true },
        },
      },
    });

    // Broadcast via Redis/Socket
    await publishToRedis('edushare:events', {
      room: `classroom:${classroomId}`,
      event: 'chat:message',
      payload: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    });

    // Get classroom name for notification
    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
      select: { name: true },
    });

    // Send push notification
    const senderName = session.user.name || 'Someone';
    const typeLabel = parsed.data.type === 'doubt' ? '❓ Doubt' : parsed.data.type === 'material_share' ? '📎 Shared Material' : '💬 Message';

    sendPushToClassroom(classroomId, session.user.id, {
      title: `${typeLabel} in ${classroom?.name || 'Classroom'}`,
      body: `${senderName}: ${parsed.data.content.substring(0, 120)}`,
      url: `/student/classroom/${classroomId}`,
      tag: `chat-${classroomId}`,
    }).catch(console.error);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('POST chat message error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Verify that a user is either the teacher of or enrolled in the classroom
 */
async function verifyClassroomAccess(userId: string, classroomId: string): Promise<boolean> {
  // Check if admin
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === 'ADMIN') return true;

  // Check if teacher
  const classroom = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { teacherId: true },
  });
  if (classroom?.teacherId === userId) return true;

  // Check if enrolled
  const enrollment = await db.enrollment.findUnique({
    where: { userId_classroomId: { userId, classroomId } },
  });
  return !!enrollment;
}

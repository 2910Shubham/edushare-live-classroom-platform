import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  isApproved: z.boolean().optional(),
});

const deleteUserSchema = z.object({
  userId: z.string(),
});

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role;

  if (!session?.user?.id || role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { userId: session.user.id };
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId: currentUserId, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { userId, role, isApproved } = parsed.data;

    if (role === undefined && isApproved === undefined) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    if (userId === currentUserId && ((role !== undefined && role !== 'ADMIN') || isApproved === false)) {
      return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role, isApproved: role === 'ADMIN' ? true : isApproved } : { isApproved }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const parsed = deleteUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (parsed.data.userId === userId) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }

    await db.user.delete({
      where: { id: parsed.data.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

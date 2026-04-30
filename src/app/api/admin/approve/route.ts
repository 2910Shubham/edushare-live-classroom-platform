import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const approveSchema = z.object({
  userId: z.string(),
  approve: z.boolean(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as Record<string, unknown>)?.role;
    
    if (!session?.user?.id || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = approveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (parsed.data.userId === session.user.id && !parsed.data.approve) {
      return NextResponse.json({ error: 'You cannot reject your own admin account' }, { status: 400 });
    }

    if (parsed.data.approve) {
      await db.user.update({
        where: { id: parsed.data.userId },
        data: {
          isApproved: true,
          ...(parsed.data.role ? { role: parsed.data.role } : {}),
        },
      });
    } else {
      await db.user.delete({
        where: { id: parsed.data.userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

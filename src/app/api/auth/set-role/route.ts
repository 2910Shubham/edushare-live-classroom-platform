import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const setRoleSchema = z.object({
  role: z.enum(['TEACHER', 'STUDENT']),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = setRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { role: parsed.data.role },
    });

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error('Set role error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

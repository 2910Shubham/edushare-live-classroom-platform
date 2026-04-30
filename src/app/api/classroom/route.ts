import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

const createClassroomSchema = z.object({
  name: z.string().min(2).max(100),
  subject: z.string().max(100).optional(),
});

const joinClassroomSchema = z.object({
  code: z.string().length(6),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;

    if (role === 'ADMIN') {
      const classrooms = await db.classroom.findMany({
        include: {
          teacher: { select: { id: true, name: true, image: true } },
          _count: { select: { enrollments: true, materials: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(classrooms);
    }

    if (role === 'TEACHER') {
      const classrooms = await db.classroom.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: { select: { enrollments: true, materials: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(classrooms);
    } else {
      const enrollments = await db.enrollment.findMany({
        where: { userId: session.user.id },
        include: {
          classroom: {
            include: {
              teacher: { select: { id: true, name: true, image: true } },
              _count: { select: { enrollments: true, materials: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
      return NextResponse.json(enrollments.map((e) => e.classroom));
    }
  } catch (error) {
    console.error('GET classrooms error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only teachers can create classrooms' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createClassroomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const code = nanoid();
    const classroom = await db.classroom.create({
      data: {
        name: parsed.data.name,
        subject: parsed.data.subject || null,
        code,
        teacherId: session.user.id,
      },
      include: {
        _count: { select: { enrollments: true, materials: true } },
      },
    });

    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.error('POST classroom error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = joinClassroomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    const classroom = await db.classroom.findUnique({
      where: { code: parsed.data.code },
      include: { teacher: { select: { name: true, image: true } } },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    if (classroom.teacherId === session.user.id) {
      return NextResponse.json({ error: 'You are the teacher of this classroom' }, { status: 400 });
    }

    const existing = await db.enrollment.findUnique({
      where: {
        userId_classroomId: {
          userId: session.user.id,
          classroomId: classroom.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId: session.user.id,
        classroomId: classroom.id,
      },
      include: {
        classroom: {
          include: {
            teacher: { select: { name: true, image: true } },
            _count: { select: { enrollments: true, materials: true } },
          },
        },
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('PUT classroom error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

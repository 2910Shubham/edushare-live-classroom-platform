import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const saveAnnotationSchema = z.object({
  materialId: z.string().cuid(),
  data: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only teachers can save annotations' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = saveAnnotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const annotation = await db.annotation.create({
      data: {
        materialId: parsed.data.materialId,
        data: parsed.data.data,
      },
    });

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Save annotation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get('materialId');

    if (!materialId) {
      return NextResponse.json({ error: 'Missing materialId' }, { status: 400 });
    }

    const annotations = await db.annotation.findMany({
      where: { materialId },
      orderBy: { createdAt: 'desc' },
      take: 1, // Only get the latest state
    });

    return NextResponse.json(annotations);
  } catch (error) {
    console.error('GET annotations error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

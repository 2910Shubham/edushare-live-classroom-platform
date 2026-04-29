import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { publishToRedis } from '@/lib/redis';
import { notifyStudents } from '@/lib/notify';
import { ratelimit } from '@/lib/ratelimit';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== 'TEACHER') {
      return NextResponse.json({ error: 'Only teachers can upload' }, { status: 403 });
    }

    const { success } = await ratelimit.limit(`upload_${session.user.id}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const classroomId = formData.get('classroomId') as string;
    const title = formData.get('title') as string;

    if (!file || !classroomId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    // Verify teacher owns the classroom
    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom || classroom.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid classroom' }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'edushare', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const fileUrl = (uploadResult as any).secure_url;
    const mimeType = file.type;

    let materialType: 'IMAGE' | 'PDF' | 'PPT' | 'TEXT' = 'TEXT';
    if (mimeType.startsWith('image/')) materialType = 'IMAGE';
    else if (mimeType === 'application/pdf') materialType = 'PDF';
    else if (mimeType.includes('presentation')) materialType = 'PPT';

    const material = await db.material.create({
      data: {
        classroomId,
        uploadedById: session.user.id,
        title,
        type: materialType,
        fileUrl,
        fileSize: file.size,
        mimeType,
      },
    });

    // Notify students via Redis + DB
    await notifyStudents(
      classroomId,
      'New Material Shared',
      `${title} is now available in ${classroom.name}`,
      'material'
    );

    // Socket event to room
    await publishToRedis('edushare:events', {
      room: `classroom:${classroomId}`,
      event: 'material:new',
      payload: material,
    });

    // Fire-and-forget AI notes generation
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/generate-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: material.id }),
    }).catch(console.error);

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { publishToRedis } from '@/lib/redis';
import { notifyStudents } from '@/lib/notify';
import { ratelimit } from '@/lib/ratelimit';
import type { UploadApiResponse } from 'cloudinary';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/** Raw uploads need a real file extension in public_id or Office/Google viewers cannot detect type. */
function rawUploadPublicId(file: File): string {
  const name = file.name?.trim() || '';
  let ext = '';
  if (/\.(pdf|ppt|pptx)$/i.test(name)) {
    ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  }
  if (!ext) {
    if (file.type === 'application/pdf') ext = '.pdf';
    else if (file.type === 'application/vnd.ms-powerpoint') ext = '.ppt';
    else ext = '.pptx';
  }
  let base = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
  base = base.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 72);
  if (!base) base = 'file';
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${base}_${unique}${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== 'TEACHER' && role !== 'ADMIN') {
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

    // Verify the teacher owns the classroom. Admins may upload anywhere.
    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
    });
    if (!classroom || (role !== 'ADMIN' && classroom.teacherId !== session.user.id)) {
      return NextResponse.json({ error: 'Invalid classroom' }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.type === 'application/pdf';
    const isPpt =
      file.type === 'application/vnd.ms-powerpoint' ||
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    // PDFs/PPT as raw + public access avoids /image/upload PDF delivery quirks and matches Cloudinary docs for documents.
    // Note: Cloudinary may still return 401 for PDF/ZIP until "Allow delivery of PDF and ZIP files" is enabled (Dashboard → Settings → Security).
    const uploadOptions = {
      folder: 'edushare',
      access_mode: 'public' as const,
      resource_type: (isPdf || isPpt ? 'raw' : 'auto') as 'raw' | 'auto',
      ...(isPdf || isPpt ? { public_id: rawUploadPublicId(file) } : {}),
    };

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload failed'));
      });
      uploadStream.end(buffer);
    });

    const fileUrl = uploadResult.secure_url;
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

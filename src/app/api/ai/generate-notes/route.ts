import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { geminiFlash } from '@/lib/gemini';
import { publishToRedis } from '@/lib/redis';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const generateNotesSchema = z.object({
  materialId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = generateNotesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { materialId } = parsed.data;

    const material = await db.material.findUnique({
      where: { id: materialId },
      include: { classroom: { select: { id: true, teacherId: true } } },
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Rate limiting per classroom/teacher so we don't spam API
    const { success } = await ratelimit.limit(`ai_notes_${material.classroom.teacherId}`);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Get all enrolled students
    const enrollments = await db.enrollment.findMany({
      where: { classroomId: material.classroomId },
      select: { userId: true },
    });

    if (enrollments.length === 0) {
      return NextResponse.json({ notes: '', studentCount: 0 });
    }

    let prompt = `You are an expert study notes generator for students.
Generate clean, structured study notes in markdown format with:
## Summary
2-3 sentence overview
## Key Concepts
Bullet points of core ideas
## Definitions
Important terms and their meanings
## Remember This
Most critical points to retain
Keep it concise and student-friendly.`;

    let generatedText = '';

    if (material.type === 'TEXT' || material.type === 'PPT') {
      prompt += `\n\nGenerate notes for the following topic: ${material.title}`;
      const result = await geminiFlash.generateContent(prompt);
      const response = await result.response;
      generatedText = response.text();
    } else if (material.type === 'IMAGE' || material.type === 'PDF') {
      try {
        const imageResp = await fetch(material.fileUrl);
        const arrayBuffer = await imageResp.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        
        const mimeType = material.type === 'PDF' ? 'application/pdf' : (material.mimeType || 'image/jpeg');

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        };

        const result = await geminiFlash.generateContent([prompt, imagePart]);
        const response = await result.response;
        generatedText = response.text();
      } catch (err) {
        console.error('Gemini vision error:', err);
        prompt += `\n\nGenerate notes based only on this title since the file could not be parsed: ${material.title}`;
        const result = await geminiFlash.generateContent(prompt);
        const response = await result.response;
        generatedText = response.text();
      }
    }

    // Save notes for all enrolled students
    const noteData = enrollments.map((e) => ({
      userId: e.userId,
      materialId: material.id,
      content: generatedText,
      isAIGenerated: true,
    }));

    await db.studentNote.createMany({
      data: noteData,
      skipDuplicates: true,
    });

    // Notify students in room
    await publishToRedis('edushare:events', {
      room: `classroom:${material.classroomId}`,
      event: 'notes:ready',
      payload: { classroomId: material.classroomId, materialId: material.id },
    });

    return NextResponse.json({ notes: generatedText, studentCount: enrollments.length });
  } catch (error) {
    console.error('Generate notes error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

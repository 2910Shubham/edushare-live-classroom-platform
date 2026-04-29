import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { geminiFlash } from '@/lib/gemini';
import { ratelimit } from '@/lib/ratelimit';
import { z } from 'zod';

const spellCheckSchema = z.object({
  text: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(`spellcheck_${session.user.id}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = spellCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { text } = parsed.data;

    const prompt = `You are a helpful spell-check and grammar assistant for a teacher.
Please fix any spelling or grammar errors in the following text.
If there are no errors, just return the exact same text.
Return ONLY the corrected text, no conversational filler or explanations.

Text:
"${text}"`;

    const result = await geminiFlash.generateContent(prompt);
    const response = await result.response;
    const correctedText = response.text().replace(/^"|"$/g, '').trim();

    return NextResponse.json({ original: text, corrected: correctedText });
  } catch (error) {
    console.error('Spell check error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { songs } from '@/src/db/schema';
import { SongStyle } from '@/lib/lyrics';
import { createOpenRouterClient } from '@/lib/openrouter';
import { enqueueAudioJob, reserveCredit, refundCredit } from '@/lib/db-service';

interface GenerateSongRequest {
  story: string;
  style: SongStyle;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSongRequest = await request.json();
    const { story, style } = body;

    if (!story || story.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Story is too short' },
        { status: 400 }
      );
    }

    const validStyles: SongStyle[] = ['sad', 'savage', 'healing', 'vibe', 'meme'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { success: false, error: 'Invalid style selected' },
        { status: 400 }
      );
    }

    console.log('Step 1: Generating song prompt with OpenRouter...');
    
    let promptResult;
    try {
      const openRouterClient = createOpenRouterClient();
      promptResult = await openRouterClient.generateSongPrompt({
        extractedText: story,
        style,
      });
      
      if (!promptResult.prompt || promptResult.prompt.length < 20) {
        throw new Error('Generated lyrics are too short');
      }
      
      console.log('Step 2: Prompt generated:', promptResult.title);
    } catch (promptError) {
      console.error('OpenRouter prompt generation failed:', promptError);
      
      promptResult = {
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} HeartHeal Song`,
        tags: `${style}, emotional, heartbreak, healing`,
        prompt: `A ${style} song about heartbreak, emotional healing, and moving forward.\n${story.substring(0, 200)}`,
      };
      
      console.log('Using fallback prompt template');
    }

    let previewUrl = '/audio/placeholder-preview.mp3';
    let fullUrl = '/audio/placeholder-full.mp3';
    let lyrics = promptResult.prompt;
    let duration = 30;

    // Insert a song row immediately with placeholder URLs. We'll enqueue a background
    // job to generate the actual audio and update this song when complete.
    const [song] = await db.insert(songs).values({
      title: promptResult.title,
      story,
      style,
      lyrics: lyrics,
      genre: promptResult.tags,
      mood: style,
      previewUrl,
      fullUrl,
      isPurchased: false,
    }).returning();

    // If the request provided a userId (or via header), attempt to reserve a credit
    // for pro users before enqueueing the job. The client may pass userId in body.
    const bodyJson = await request.json().catch(() => ({}));
    const userId = (bodyJson && bodyJson.userId) || (request.headers.get('x-user-id') || null);
    let reservedCredit = false;
    if (userId) {
      try {
        reservedCredit = await reserveCredit(userId);
        if (!reservedCredit) {
          // return an error indicating no credits
          return NextResponse.json({ success: false, error: 'no_credits' }, { status: 402 });
        }
      } catch (e) {
        console.warn('Failed to reserve credit for user:', e);
      }
    }

    const jobPayload = {
      songId: song.id,
      userId: userId,
      prompt: promptResult.prompt,
      title: promptResult.title,
      tags: promptResult.tags,
      style,
      reservedCredit
    };

    const jobId = await enqueueAudioJob({ userId: userId || song.id, type: 'song', payload: jobPayload });
    if (!jobId) {
      // enqueue failed: refund reserved credit if any
      if (reservedCredit && userId) {
        try { await refundCredit(userId); } catch (e) { console.warn('Failed to refund credit after enqueue failure', e); }
      }
      return NextResponse.json({ success: false, error: 'failed_to_enqueue' }, { status: 500 });
    }

    return NextResponse.json({ success: true, songId: song.id, jobId, title: promptResult.title, lyrics });
  } catch (error) {
    console.error('Error generating song:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate song',
      },
      { status: 500 }
    );
  }
}

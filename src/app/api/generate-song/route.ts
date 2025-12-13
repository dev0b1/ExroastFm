import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { songs } from '@/src/db/schema';
// OpenRouter removed: use user story + style + musicStyle directly as prompt
import { enqueueAudioJob, reserveCredit, refundCredit } from '@/lib/db-service';
import { PREMADE_ONLY } from '@/src/lib/config';

interface GenerateSongRequest {
  story: string;
  style: string;
  musicStyle?: string;
  overrideLyrics?: string;
  songId?: string;
  paidPurchase?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSongRequest = await request.json();
    console.info('[api/generate-song] POST received', { storyPreview: body.story?.slice(0,120), style: body.style, musicStyle: body.musicStyle, hasOverrideLyrics: !!body.overrideLyrics, songId: body.songId, paidPurchase: body.paidPurchase });
    const { story, style, musicStyle, overrideLyrics, songId: existingSongId, paidPurchase } = body;

    if (!story || story.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Story is too short' },
        { status: 400 }
      );
    }

    const validStyles = ['sad', 'savage', 'healing', 'vibe', 'meme', 'petty', 'glowup'];
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { success: false, error: 'Invalid style selected' },
        { status: 400 }
      );
    }

    console.log('Step 1: Preparing song prompt (user-provided flow)...');

    // If the client provided edited/override lyrics, use them directly.
    let promptResult;
    if (overrideLyrics && overrideLyrics.trim().length > 10) {
      promptResult = {
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} Song (Custom Lyrics)`,
        tags: `${style}, custom, heartbreak`,
        prompt: overrideLyrics.trim(),
      };
      console.log('Using override lyrics provided by client');
    } else {
      // Use the raw user story + style + musicStyle as the generation prompt.
      // Keep the prompt concise and explicit for the music provider.
      const mode = musicStyle && musicStyle.trim() ? musicStyle.trim() : 'standard';
      promptResult = {
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} Song`,
        tags: `${style}${musicStyle && musicStyle.trim() ? `, ${musicStyle.trim()}` : ''}`,
        prompt: `${story}\n\nStyle: ${style}\nMode: ${mode}\n\nWrite concise lyrics suitable for a ~60s song. Include a memorable hook and 2-3 lines of verse.`,
      };
      console.log('Using user story directly as prompt for generation');
    }

    let previewUrl = '/audio/placeholder-preview.mp3';
    let fullUrl = '/audio/placeholder-full.mp3';
    let lyrics = promptResult.prompt;
    // If a musical style was provided by the client, append it to tags so the audio job can use it
    if (musicStyle && musicStyle.trim().length > 0) {
      promptResult.tags = `${promptResult.tags}, ${musicStyle}`;
    }
    let duration = 30;

    let song: any = null;

    // If an existing songId was provided (e.g., the user purchased a demo and now
    // wants a personalized generation), update that row instead of inserting a new one.
    if (existingSongId) {
      const rows = await db.select().from(songs).where(eq(songs.id, existingSongId)).limit(1);
      if (rows && rows.length > 0) {
        song = rows[0];
        // Defensive: do not allow using a template song row as the target for a personalized generation
        if (song.isTemplate) {
          console.warn('[api/generate-song] attempt to use template song id for generation', { existingSongId });
          return NextResponse.json({ success: false, error: 'cannot_use_template_id' }, { status: 400 });
        }
        // Update lyrics (if override provided) and set placeholder urls while job runs
        await db.update(songs).set({
          lyrics: lyrics,
          previewUrl,
          fullUrl,
          updatedAt: new Date()
        }).where(eq(songs.id, existingSongId));
        song = { ...song, lyrics, previewUrl, fullUrl };
      } else {
        return NextResponse.json({ success: false, error: 'song_not_found' }, { status: 404 });
      }
    } else {
      // Insert a song row immediately with placeholder URLs. We'll enqueue a background
      // job to generate the actual audio and update this song when complete.
      const [inserted] = await db.insert(songs).values({
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
      song = inserted;
      console.info('[api/generate-song] inserted song row', { songId: song.id, previewUrl, fullUrl });
    }

    // If the request provided a userId (or via header), attempt to reserve a credit
    // for pro users before enqueueing the job. The client may pass userId in body.
    const bodyJson = await request.json().catch(() => ({}));
    const userId = (bodyJson && bodyJson.userId) || (request.headers.get('x-user-id') || null);
    let reservedCredit = false;
    // Do not reserve credits when this generation is being kicked off as part of
    // a paid single-song checkout (paidPurchase === true). In that case the
    // purchase webhook is authoritative and we should not deduct subscription credits.
    if (userId && !paidPurchase) {
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
      musicStyle: musicStyle || null,
      reservedCredit
    };

    // Personalized provider generation has been removed.
    // Skip any external provider calls — we rely on template previews for free users
    // and premade/premium songs for paid users.
    let providerTaskId: string | undefined | null = null;
    console.info('[api/generate-song] provider integration disabled — skipping external generation');

    // Do not enqueue jobs — provider generation is disabled. Inform caller.
    // The system currently supports template previews for free users; premium
    // purchases will map to premade `premium_songs` entries (mp4/mp3 files).
    return NextResponse.json({
      success: false,
      error: 'personalized_generation_disabled',
      message: 'Personalized generation is disabled. Use template previews or purchase premium premade songs.'
    }, { status: 503 });
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

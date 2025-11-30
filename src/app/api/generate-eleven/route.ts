import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { songs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import { generateLyricsFromLLM, splitLyricsIntoLines } from '@/lib/llm';
import { generateMusicWithEleven } from '@/lib/eleven';

interface ReqBody {
  story: string;
  style: string;
  mood?: string;
  duration?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: ReqBody = await req.json();
    const { story, style, mood, duration } = body;
    if (!story || story.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'story_too_short' }, { status: 400 });
    }

    // Insert song row with placeholders
    const [inserted] = await db.insert(songs).values({
      title: `${style.charAt(0).toUpperCase() + style.slice(1)} Roast`,
      story,
      style,
      lyrics: '',
      previewUrl: '',
      fullUrl: '',
      isPurchased: false,
    }).returning();

    const songId = inserted.id;
    console.info('[generate-eleven] created song row', { songId });

    // Simplified synchronous flow: generate lyrics, request ElevenLabs audio, and update song row
    try {
      const lyrics = await generateLyricsFromLLM(story, style, mood || 'savage', 10);
      // Update lyrics in DB
      try {
        await db.update(songs).set({ lyrics, updatedAt: new Date() }).where(eq(songs.id, songId));
      } catch (e) { console.warn('[generate-eleven] failed updating lyrics', e); }

      // Request audio from ElevenLabs (expecting an audio_url in response)
      const elevenResp = await generateMusicWithEleven(lyrics, style, mood || 'savage', duration || 60);
      const audioUrl = elevenResp.audioUrl || null;
      if (!audioUrl) {
        console.error('[generate-eleven] ElevenLabs did not return audioUrl', elevenResp);
        return NextResponse.json({ success: false, error: 'no_audio_url' }, { status: 502 });
      }

      // Update song with audio URL (use as fullUrl/previewUrl)
      const publicUrl = audioUrl;
      try {
        await db.update(songs).set({ fullUrl: publicUrl, previewUrl: publicUrl, isPurchased: true, updatedAt: new Date() }).where(eq(songs.id, songId));
      } catch (e) { console.warn('[generate-eleven] failed to update song with audio url', e); }

      return NextResponse.json({ success: true, songId, audioUrl: publicUrl, lyrics });
    } catch (err: any) {
      console.error('[generate-eleven] synchronous pipeline failed', err);
      return NextResponse.json({ success: false, error: err?.message || 'pipeline_error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[generate-eleven] error', error);
    return NextResponse.json({ success: false, error: error.message || 'internal_error' }, { status: 500 });
  }
}

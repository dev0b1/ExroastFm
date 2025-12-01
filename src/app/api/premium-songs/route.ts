import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { premiumSongs } from '@/src/db/schema';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const story = url.searchParams.get('story') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '3', 10);

    // Read from DB only. If DB returns no rows, return an empty array.
    const rows = await db.select().from(premiumSongs).limit(100);
    const manifestLike = rows.map((r: any) => ({ id: r.id, title: r.title, description: r.description || '', tags: (r.tags || '').split(',').map((t: string) => t.trim()), mp3: r.mp3, mp4: r.mp4, duration: r.duration }));

    if (story && story.trim().length > 0) {
      const words = story.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      const scored = manifestLike.map((s: any) => {
        let score = 0;
        const hay = (s.tags || []).map((t: string) => (typeof t === 'string' ? t.toLowerCase() : String(t))).concat([String(s.title || '').toLowerCase()]);
        for (const w of words) {
          for (const h of hay) {
            if (h.includes(w)) score += 1;
          }
        }
        return { song: s, score };
      });
      scored.sort((a: any, b: any) => b.score - a.score);
      const matches = scored.filter((s: any) => s.score > 0).map((s: any) => s.song).slice(0, limit);
      return NextResponse.json({ success: true, songs: matches });
    }

    const top = manifestLike.slice(0, limit);
    return NextResponse.json({ success: true, songs: top });
  } catch (err) {
    console.error('[api/premium-songs] error', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

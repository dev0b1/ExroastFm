import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getUserSubscriptionStatus } from '@/lib/db-service';

type ManifestItem = {
  filename: string;
  mode: string;
  musicStyle: string;
  title: string;
  keywords?: string;
  storageUrl: string;
  [k: string]: any;
};

async function readManifest(): Promise<ManifestItem[]> {
  const manifestPath = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');
  const raw = await readFile(manifestPath, 'utf8');
  return JSON.parse(raw) as ManifestItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { modes, musicStyles, story, limit } = body || {};

    const userId = request.headers.get('x-user-id') || undefined;
    const subscription = userId ? await getUserSubscriptionStatus(userId) : { isPro: false };

    // If user is not Pro/subscribed, indicate to caller that DB upsert or purchase is required
    if (!subscription?.isPro) {
      return NextResponse.json({ success: true, useDb: true, message: 'User not subscribed' }, { status: 200 });
    }

    const items = await readManifest();
    let results: (ManifestItem & { score?: number })[] = items.map(i => ({ ...i, score: 0 }));

    // Filter by modes
    if (Array.isArray(modes) && modes.length > 0) {
      results = results.filter(r => modes.includes(r.mode));
    }

    // Filter by musicStyles
    if (Array.isArray(musicStyles) && musicStyles.length > 0) {
      results = results.filter(r => musicStyles.includes(r.musicStyle));
    }

    // If story provided, do a simple keyword match scoring
    if (typeof story === 'string' && story.trim().length > 0) {
      const s = story.toLowerCase();
      results = results.map(r => {
        const kws = (r.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
        const score = kws.reduce((acc, k) => acc + (s.includes(k) ? 1 : 0), 0);
        return { ...r, score };
      }).sort((a, b) => (b.score || 0) - (a.score || 0));

      // Prefer to return only scoring results if any matched
      const matched = results.filter(r => (r.score || 0) > 0);
      if (matched.length > 0) results = matched;
    }

    const sliced = typeof limit === 'number' ? results.slice(0, limit) : results;

    return NextResponse.json({ success: true, songs: sliced }, { status: 200 });
  } catch (error: any) {
    console.error('[api/premium-songs] error', error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || undefined;
    const subscription = userId ? await getUserSubscriptionStatus(userId) : { isPro: false };

    if (!subscription?.isPro) {
      return NextResponse.json({ success: true, useDb: true, message: 'User not subscribed' }, { status: 200 });
    }

    const items = await readManifest();
    return NextResponse.json({ success: true, songs: items }, { status: 200 });
  } catch (error: any) {
    console.error('[api/premium-songs GET] error', error);
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
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

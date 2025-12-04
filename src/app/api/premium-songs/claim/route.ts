import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { getUserSubscriptionStatus } from '@/lib/db-service';
import { db } from '@/server/db';
import { transactions } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

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

// Simple scoring matching (same as /api/premium-songs)
function scoreAndRank(items: ManifestItem[], story?: string) {
  let results: (ManifestItem & { score?: number })[] = items.map(i => ({ ...i, score: 0 }));
  if (typeof story === 'string' && story.trim().length > 0) {
    const s = story.toLowerCase();
    results = results.map(r => {
      const kws = (r.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
      const score = kws.reduce((acc, k) => acc + (s.includes(k) ? 1 : 0), 0);
      return { ...r, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
    const matched = results.filter(r => (r.score || 0) > 0);
    if (matched.length > 0) results = matched;
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, guestEmail, transactionId, modes, musicStyles, story, limit } = body || {};

    // If userId provided and is Pro, allow immediate claim
    const subscription = userId ? await getUserSubscriptionStatus(userId) : { isPro: false };
    let eligible = !!subscription?.isPro;

    // If transactionId supplied, look up transaction and validate
    let matchedTx: any = null;
    if (!eligible && transactionId) {
      const rows = await db.select().from(transactions).where(eq(transactions.id, String(transactionId))).limit(1);
      if (rows && rows.length > 0) {
        matchedTx = rows[0];
        // treat any recorded transaction as eligible (webhook should have inserted it)
        eligible = true;
      }
    }

    // If guestEmail supplied and no tx id, try to find an unclaimed transaction matching email
    if (!eligible && guestEmail) {
      const email = String(guestEmail).trim().toLowerCase();
      if (email) {
        const rows = await db.select().from(transactions).where(sql`paddle_data ILIKE ${'%' + email + '%'} AND user_id IS NULL`).limit(5);
        if (rows && rows.length > 0) {
          matchedTx = rows[0];
          eligible = true;
        }
      }
    }

    // If still not eligible, require purchase (caller should redirect to checkout)
    if (!eligible) {
      return NextResponse.json({ success: true, useDb: true, message: 'Purchase required' }, { status: 200 });
    }

    // Read manifest and filter
    const items = await readManifest();
    let results = items;

    if (Array.isArray(modes) && modes.length > 0) {
      results = results.filter(r => modes.includes(r.mode));
    }
    if (Array.isArray(musicStyles) && musicStyles.length > 0) {
      results = results.filter(r => musicStyles.includes(r.musicStyle));
    }

    // Apply scoring and ranking
    const scored = scoreAndRank(results, story || undefined);
    const pick = (scored && scored.length > 0) ? scored[0] : (results[0] || null);

    if (!pick) {
      return NextResponse.json({ success: false, error: 'no_match' }, { status: 404 });
    }

    // Attach claim to transaction if present: set songId = filename (or storageUrl) and userId
    try {
      if (matchedTx) {
        const updates: any = {};
        // Use storageUrl as canonical file reference
        updates.songId = pick.filename || pick.storageUrl || null;
        if (userId) updates.userId = userId;
        await db.update(transactions).set(updates).where(eq(transactions.id, matchedTx.id));
      }
    } catch (e) {
      console.warn('[premium-songs/claim] failed to attach claim to transaction', e);
    }

    // Return the chosen song metadata
    const responseSong = {
      filename: pick.filename,
      title: pick.title,
      storageUrl: pick.storageUrl,
      mode: pick.mode,
      musicStyle: pick.musicStyle,
    };

    return NextResponse.json({ success: true, song: responseSong }, { status: 200 });
  } catch (err: any) {
    console.error('[api/premium-songs/claim] error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

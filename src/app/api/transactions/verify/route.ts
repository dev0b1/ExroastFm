import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { transactions, songs } from '@/src/db/schema';
import { loadManifest, getById } from '@/lib/premium-songs';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, songId } = body || {};

    if (!transactionId && !songId) {
      return NextResponse.json({ verified: false, error: 'transactionId or songId required' }, { status: 400 });
    }

    if (transactionId) {
      const res = await db.select().from(transactions).where(eq(transactions.id, String(transactionId))).limit(1);
      if (res.length === 0) return NextResponse.json({ verified: false });
      const tx = res[0];
      const ok = tx.status === 'paid' || tx.status === 'completed' || tx.status === 'succeeded' || tx.status === 'success';
      return NextResponse.json({ verified: ok, transaction: tx });
    }

    if (songId) {
      // First, check the `songs` table for generated/personalized songs
      const res = await db.select().from(songs).where(eq(songs.id, String(songId))).limit(1);
      if (res.length > 0) {
        const song = res[0];
        return NextResponse.json({ verified: !!song.isPurchased, song });
      }

      // If no entry in `songs`, fall back to looking for a matching transaction
      // (this supports premade purchases where `songId` refers to a premium manifest id or filename)
      const txs = await db.select().from(transactions).where(eq(transactions.songId, String(songId))).limit(5);
      if (txs && txs.length > 0) {
        const tx = txs[0];
        const ok = tx.status === 'paid' || tx.status === 'completed' || tx.status === 'succeeded' || tx.status === 'success';
        return NextResponse.json({ verified: ok, transaction: tx });
      }

      // No transaction found: as an MVP shortcut, trust the checkout and treat
      // a known premade manifest `songId` as verified so the Success page can
      // immediately return the premade mp4/video without waiting for webhook.
      try {
        const prem = getById(String(songId));
        if (prem) {
          const fullUrl = (prem as any).mp4 || (prem as any).mp3 || (prem as any).storageUrl || null;
          return NextResponse.json({ verified: true, premade: { id: prem.id || songId, fullUrl } });
        }
        // Also support matching by filename/mp4/mp3 in manifest entries
        const manifest = loadManifest();
        const match = (manifest || []).find((m: any) => {
          if (!m) return false;
          const candidates = [m.id, m.mp4, m.mp3, m.storageUrl, m.filename].filter(Boolean).map(String);
          return candidates.includes(String(songId)) || candidates.some((c) => c.endsWith(`/${songId}`) || c.includes(`/${songId}/`));
        });
        if (match) {
          const fullUrl = (match as any).mp4 || (match as any).mp3 || (match as any).storageUrl || null;
          return NextResponse.json({ verified: true, premade: { id: match.id || songId, fullUrl } });
        }
      } catch (e) {
        // ignore lookup errors and fall through to not-verified
        console.warn('[verify transaction] premade manifest lookup failed', e);
      }

      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({ verified: false });
  } catch (err: any) {
    console.error('[verify transaction] error', err);
    return NextResponse.json({ verified: false, error: String(err?.message || err) }, { status: 500 });
  }
}

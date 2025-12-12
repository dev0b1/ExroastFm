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
        // If this is a template-generated DB row (preview MP3), attempt to
        // map it back to a premade manifest entry so we can immediately
        // return the premade MP4 instead of the template MP3.
        try {
          if (song.isTemplate && song.previewUrl) {
            const prem = getById(String(song.previewUrl)) || getById(String(song.previewUrl).split('/').pop() || '');
            if (prem) {
              const storage = prem.storageUrl || null;
              const fullUrl = prem.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || prem.mp3 || storage || null;
              return NextResponse.json({ verified: true, premade: { id: prem.id || String(songId), fullUrl } });
            }
          }
        } catch (e) {
          console.warn('[verify transaction] failed to map template song to premade manifest', e);
        }

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
          const p: any = prem;
          // Prefer explicit mp4, then storageUrl if it points to an mp4 file,
          // then mp3, then any storageUrl.
          const storage = p.storageUrl || null;
          const fullUrl = p.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || p.mp3 || storage || null;
          return NextResponse.json({ verified: true, premade: { id: p.id || songId, fullUrl } });
        }
        // Also support matching by filename/mp4/mp3 in manifest entries
        const manifest = loadManifest();
        const match = (manifest || []).find((m: any) => {
          if (!m) return false;
          const candidates = [m.id, m.mp4, m.mp3, m.storageUrl, m.filename].filter(Boolean).map(String);
          return candidates.includes(String(songId)) || candidates.some((c) => c.endsWith(`/${songId}`) || c.includes(`/${songId}/`));
        });
        if (match) {
          const m: any = match;
          const storage = m.storageUrl || null;
          const fullUrl = m.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || m.mp3 || storage || null;
          return NextResponse.json({ verified: true, premade: { id: m.id || songId, fullUrl } });
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

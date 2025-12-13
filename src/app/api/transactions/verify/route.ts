import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { transactions, songs } from '@/src/db/schema';
import { loadManifest, getById, findBestMatches } from '@/lib/premium-songs';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

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

          // If this is a template/preview row, prefer returning a matched premade MP4
          // so users receive a premium MP4 after checkout instead of the same preview MP3.
          if (song.isTemplate) {
            try {
              const matches = findBestMatches(song.story || song.prompt || song.lyrics || '', 3) || [];
              for (const m of matches) {
                if (!m) continue;
                const storage = m.storageUrl || null;
                const publicMp4 = path.join(process.cwd(), 'public', 'premium-songs', `${String(m.id)}.mp4`);
                const publicFilenameMp4 = m.filename ? path.join(process.cwd(), 'public', 'premium-songs', m.filename) : null;
                const fullUrlCandidate = m.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || null;
                if (fullUrlCandidate) {
                  return NextResponse.json({ verified: true, premade: { id: m.id || String(m.filename || m.storageUrl || ''), fullUrl: fullUrlCandidate } });
                }
                try {
                  if (fs.existsSync(publicMp4)) {
                    return NextResponse.json({ verified: true, premade: { id: m.id || String(m.filename || ''), fullUrl: `/premium-songs/${String(m.id)}.mp4` } });
                  }
                  if (publicFilenameMp4 && fs.existsSync(publicFilenameMp4)) {
                    const fname = m.filename ? m.filename : `${String(m.id)}.mp4`;
                    return NextResponse.json({ verified: true, premade: { id: m.id || fname.replace(/\.[^.]+$/, ''), fullUrl: `/premium-songs/${fname}` } });
                  }
                } catch (e) {
                  // continue to next candidate
                }
              }
            } catch (e) {
              console.warn('[verify transaction] premade matching failed', e);
            }
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

        // Fallback: if a matching file exists under public/premium-songs/<songId>.mp4 or .mp3,
        // return that URL so the Success page can immediately show the premade asset.
        try {
          const publicMp4 = path.join(process.cwd(), 'public', 'premium-songs', `${String(songId)}.mp4`);
          const publicMp3 = path.join(process.cwd(), 'public', 'premium-songs', `${String(songId)}.mp3`);
          if (fs.existsSync(publicMp4)) {
            return NextResponse.json({ verified: true, premade: { id: String(songId), fullUrl: `/premium-songs/${String(songId)}.mp4` } });
          }
          if (fs.existsSync(publicMp3)) {
            return NextResponse.json({ verified: true, premade: { id: String(songId), fullUrl: `/premium-songs/${String(songId)}.mp3` } });
          }
        } catch (fsErr) {
          console.warn('[verify transaction] public file lookup failed', fsErr);
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

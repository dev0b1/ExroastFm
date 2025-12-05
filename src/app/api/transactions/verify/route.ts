import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { transactions, songs, purchases } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, songId, purchaseId } = body || {};

    if (!transactionId && !songId && !purchaseId) {
      return NextResponse.json({ verified: false, error: 'transactionId, songId or purchaseId required' }, { status: 400 });
    }

    if (transactionId) {
      const res = await db.select().from(transactions).where(eq(transactions.id, String(transactionId))).limit(1);
      if (res.length === 0) return NextResponse.json({ verified: false });
      const tx = res[0];
      const ok = tx.status === 'paid' || tx.status === 'completed' || tx.status === 'succeeded' || tx.status === 'success';
      return NextResponse.json({ verified: ok, transaction: tx });
    }

    if (purchaseId) {
      const res = await db.select().from(purchases).where(eq(purchases.id, String(purchaseId))).limit(1);
      if (res.length === 0) return NextResponse.json({ verified: false });
      const purchase = res[0];
      const ok = purchase.status === 'paid' || !!purchase.assignedSongId;
      return NextResponse.json({ verified: ok, purchase });
    }

    if (songId) {
      const res = await db.select().from(songs).where(eq(songs.id, String(songId))).limit(1);
      if (res.length === 0) return NextResponse.json({ verified: false });
      const song = res[0];
      return NextResponse.json({ verified: !!song.isPurchased, song });
    }

    return NextResponse.json({ verified: false });
  } catch (err: any) {
    console.error('[verify transaction] error', err);
    return NextResponse.json({ verified: false, error: String(err?.message || err) }, { status: 500 });
  }
}

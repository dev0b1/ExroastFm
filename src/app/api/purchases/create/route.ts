import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { purchases } from '@/src/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, guestEmail, modes, musicStyles, story } = body || {};

    const insert = {
      userId: userId || null,
      guestEmail: guestEmail || null,
      modes: modes ? JSON.stringify(modes) : null,
      musicStyles: musicStyles ? JSON.stringify(musicStyles) : null,
      story: story || null,
      status: 'pending',
    } as any;

    const res = await db.insert(purchases).values(insert).returning();
    const created = Array.isArray(res) ? res[0] : res;
    return NextResponse.json({ success: true, purchaseId: created.id }, { status: 201 });
  } catch (err: any) {
    console.error('[api/purchases/create] error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

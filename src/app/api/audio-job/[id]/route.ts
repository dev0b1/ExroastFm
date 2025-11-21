import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { audioGenerationJobs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, context: any) {
  try {
    const params = context?.params;
    const resolvedParams = params && typeof params.then === 'function' ? await params : params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ success: false, error: 'missing_id' }, { status: 400 });

    const rows = await db.select().from(audioGenerationJobs).where(eq(audioGenerationJobs.id, id)).limit(1);
    if (!rows || rows.length === 0) return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });

    const job = rows[0];
    return NextResponse.json({ success: true, job: { id: job.id, status: job.status, resultUrl: job.resultUrl || null, error: job.error || null, attempts: job.attempts } });
  } catch (err) {
    console.error('Audio job status error:', err);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}

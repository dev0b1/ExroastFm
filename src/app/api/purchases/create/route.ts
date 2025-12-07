import { NextResponse } from 'next/server';

// Endpoint intentionally removed — kept as a 410 stub to satisfy build/type generation.
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Endpoint removed: pending purchases are no longer supported'
  }, { status: 410 });
}

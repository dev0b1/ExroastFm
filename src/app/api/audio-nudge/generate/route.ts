import { NextRequest, NextResponse } from 'next/server';

// Suno/audio-nudge removed — return explicit 503 to callers.
export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: false, error: 'suno_disabled', message: 'Audio nudges are disabled. Suno integration removed.' }, { status: 503 });
}

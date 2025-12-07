import { NextResponse } from 'next/server';

// A tiny heuristic matcher that returns a plausible "best match" template name
// for a pending song. In a real system this would call ML/template rules or
// use the song's metadata. For now return a deterministic choice based on
// a simple hash of the songId so the result is stable.

const TEMPLATES = [
  'glowup_pop_01',
  'petty_rap_01',
  'heartbreak_ballad_01',
  'revenge_anthem_01',
  'acoustic_sad_01',
  'synthwave_sad_01',
  'indie_breakup_01'
];

function hashToIndex(id: string | null | undefined) {
  if (!id) return 0;
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % TEMPLATES.length;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const songId = url.searchParams.get('songId');
    const idx = hashToIndex(songId);
    const bestMatch = TEMPLATES[idx];
    return NextResponse.json({ success: true, bestMatch });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'matcher_failed' }, { status: 500 });
  }
}

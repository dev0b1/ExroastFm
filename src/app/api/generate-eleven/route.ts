import { NextRequest, NextResponse } from 'next/server';

/**
 * ElevenLabs audio generation is disabled.
 * Premium songs are now assigned from the database instead of generating new audio.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'audio_generation_disabled',
      message: 'ElevenLabs audio generation has been disabled. Premium songs are now assigned from the database.'
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}

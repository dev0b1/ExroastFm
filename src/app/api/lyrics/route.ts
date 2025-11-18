import { NextRequest, NextResponse } from 'next/server';
import { LYRICS_DATA } from '@/lib/lyrics-data';

export async function GET(request: NextRequest) {
  try {
    const templateId = request.nextUrl.searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'templateId is required' },
        { status: 400 }
      );
    }

    // The templateId corresponds to the filename without extension
    // E.g., 'petty-breakup' for 'petty-breakup.mp3'
    const lyrics = LYRICS_DATA[templateId];

    if (!lyrics) {
      return NextResponse.json(
        { success: false, error: 'Lyrics not found for this template' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      templateId,
      lyrics,
      length: lyrics.split('\n').length,
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch lyrics',
      },
      { status: 500 }
    );
  }
}

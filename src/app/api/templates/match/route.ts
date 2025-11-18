import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/db-service';
import { matchTemplate } from '@/lib/template-matcher';
import { LYRICS_DATA } from '@/lib/lyrics-data';

export async function POST(request: NextRequest) {
  try {
    const { story, mode } = await request.json();

    if (!story || !mode) {
      return NextResponse.json(
        { success: false, error: 'Story and mode are required' },
        { status: 400 }
      );
    }

    const templates = await getAllTemplates();
    
    if (templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No templates available. Please add templates first.'
      }, { status: 404 });
    }

    const match = matchTemplate(story, mode, templates);
    
    if (!match) {
      const fallback = templates[0];
      const templateId = fallback.filename.replace('.mp3', '');
      const lyrics = LYRICS_DATA[templateId] || '';
      
      return NextResponse.json({
        success: true,
        template: fallback,
        lyrics,
        score: 0,
        matchedKeywords: [],
        isFallback: true
      });
    }

    // Get lyrics for the matched template
    const templateId = match.template.filename.replace('.mp3', '');
    const lyrics = LYRICS_DATA[templateId] || '';

    return NextResponse.json({
      success: true,
      template: match.template,
      lyrics,
      score: match.score,
      matchedKeywords: match.matchedKeywords,
      isFallback: false
    });
  } catch (error) {
    console.error('Error matching template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to match template'
      },
      { status: 500 }
    );
  }
}

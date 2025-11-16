import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllTemplates, saveRoast } from '@/lib/supabase-service';
import { matchTemplate } from '@/lib/template-matcher';

export async function POST(request: NextRequest) {
  try {
    const { story, style } = await request.json();

    if (!story || story.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Story is too short (min 10 characters)' },
        { status: 400 }
      );
    }

    console.log('Free user - generating template-based preview');

    const templates = await getAllTemplates();
    
    if (templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template system not set up yet. Please upgrade to Pro for AI-generated songs.'
      }, { status: 503 });
    }

    const match = matchTemplate(story, style, templates);
    const selectedTemplate = match ? match.template : templates[0];

    console.log('Selected template:', selectedTemplate.filename, 'Score:', match?.score || 0);

    const song = await prisma.song.create({
      data: {
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} Roast`,
        lyrics: `Template roast based on your ${style} vibe!\n\n(Upgrade to Pro for personalized lyrics based on your story)`,
        previewUrl: selectedTemplate.storageUrl,
        fullUrl: '',
        style,
        story: story.substring(0, 500),
        duration: 15,
        isPurchased: false,
        isTemplate: true
      },
    });

    try {
      await saveRoast({
        story: story.substring(0, 500),
        mode: style,
        title: song.title,
        lyrics: song.lyrics || '',
        audioUrl: selectedTemplate.storageUrl,
        isTemplate: true
      });
    } catch (saveError) {
      console.log('Failed to save roast (non-critical):', saveError);
    }

    return NextResponse.json({
      success: true,
      songId: song.id,
      title: song.title,
      message: 'Template preview generated! Upgrade to Pro for personalized roasts.',
      isTemplate: true,
      matchScore: match?.score || 0
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview'
      },
      { status: 500 }
    );
  }
}

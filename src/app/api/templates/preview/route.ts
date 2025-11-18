import { NextRequest, NextResponse } from 'next/server';
import { uploadPreviewAudio } from '@/lib/file-storage';
import { readFile } from 'fs/promises';
import path from 'path';

// This route requires server-side dependencies
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { templateUrl, templateId } = await request.json();

    if (!templateUrl || !templateId) {
      return NextResponse.json(
        { success: false, error: 'Template URL and ID required' },
        { status: 400 }
      );
    }
    
    const previewFilename = `preview_${templateId}_${Date.now()}.mp3`;

    let audioBuffer: Buffer;
    
    if (templateUrl.startsWith('/')) {
      const localPath = path.join(process.cwd(), 'public', templateUrl.replace(/^\//, ''));
      audioBuffer = await readFile(localPath);
    } else {
      const audioResponse = await fetch(templateUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch template audio');
      }
      audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    }
    
    // TODO: Trim to 15 seconds when FFmpeg is moved to external service
    // For now, return full audio as preview
    const previewUrl = await uploadPreviewAudio(audioBuffer, previewFilename);

    if (!previewUrl) {
      throw new Error('Failed to upload preview');
    }

    return NextResponse.json({
      success: true,
      previewUrl
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

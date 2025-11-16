import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase-service';
import { trimAudioToPreview } from '@/lib/audio-utils';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { templateUrl, templateId } = await request.json();

    if (!templateUrl || !templateId) {
      return NextResponse.json(
        { success: false, error: 'Template URL and ID required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    
    const previewFilename = `preview_${templateId}_${Date.now()}.mp3`;
    const tempFullPath = path.join('/tmp', `full_${Date.now()}.mp3`);
    const tempPreviewPath = path.join('/tmp', previewFilename);

    const audioResponse = await fetch(templateUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch template audio');
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    
    await trimAudioToPreview(audioBuffer, tempPreviewPath, 15, 0);

    const previewBuffer = await import('fs/promises').then(fs => fs.readFile(tempPreviewPath));
    
    const { data, error } = await supabase.storage
      .from('templates')
      .upload(`previews/${previewFilename}`, previewBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    await unlink(tempPreviewPath).catch(() => {});
    await unlink(tempFullPath).catch(() => {});

    if (error) {
      throw new Error('Failed to upload preview');
    }

    const { data: publicData } = supabase.storage
      .from('templates')
      .getPublicUrl(`previews/${previewFilename}`);

    return NextResponse.json({
      success: true,
      previewUrl: publicData.publicUrl
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

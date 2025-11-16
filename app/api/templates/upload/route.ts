import { NextRequest, NextResponse } from 'next/server';
import { uploadTemplateAudio } from '@/lib/file-storage';
import { createTemplate } from '@/lib/db-service';

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('audio') as File;
    const keywords = formData.get('keywords') as string;
    const mode = formData.get('mode') as string;
    const mood = formData.get('mood') as string;

    if (!file || !keywords || !mode || !mood) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name}`;
    
    const storageUrl = await uploadTemplateAudio(buffer, filename);
    
    if (!storageUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to upload audio file' },
        { status: 500 }
      );
    }

    const success = await createTemplate({
      filename,
      keywords,
      mode,
      mood,
      storageUrl
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to create template record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template uploaded successfully',
      storageUrl
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload template'
      },
      { status: 500 }
    );
  }
}

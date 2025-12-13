import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/server/db';
import { premiumSongs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Proxy route to serve premium video files with correct content-type headers.
 * This ensures videos are served with proper MIME types and CORS headers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Decode filename in case it's URL encoded
    const decodedFilename = decodeURIComponent(filename);
    
    // Security: Only allow mp4 files
    if (!decodedFilename.endsWith('.mp4')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Try to find the video in the database first
    const dbResult = await db.select().from(premiumSongs).where(eq(premiumSongs.id, decodedFilename.replace('.mp4', ''))).limit(1);
    
    let videoUrl: string | null = null;
    
    if (dbResult && dbResult.length > 0 && dbResult[0].mp4) {
      videoUrl = dbResult[0].mp4;
    } else {
      // Try to find by filename in database
      const allSongs = await db.select().from(premiumSongs);
      const match = allSongs.find((s: any) => 
        s.mp4?.includes(decodedFilename) || 
        s.id === decodedFilename.replace('.mp4', '')
      );
      if (match?.mp4) {
        videoUrl = match.mp4;
      }
    }

    // If we found an external URL, redirect to it (or proxy it)
    if (videoUrl && videoUrl.startsWith('http')) {
      // For external URLs, we can either redirect or proxy
      // Proxying ensures CORS and correct headers, but uses more bandwidth
      try {
        const videoResponse = await fetch(videoUrl, {
          headers: {
            'Range': request.headers.get('Range') || '',
          },
        });

        if (!videoResponse.ok) {
          return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const videoBuffer = await videoResponse.arrayBuffer();
        const contentType = videoResponse.headers.get('content-type') || 'video/mp4';

        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': videoBuffer.byteLength.toString(),
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (error) {
        console.error('[video proxy] error fetching external video', error);
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
      }
    }

    // Try local file in public/premium-songs
    const localPath = path.join(process.cwd(), 'public', 'premium-songs', decodedFilename);
    
    try {
      const videoBuffer = await readFile(localPath);
      
      return new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      console.error('[video proxy] file not found locally', { localPath, error });
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[video proxy] error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



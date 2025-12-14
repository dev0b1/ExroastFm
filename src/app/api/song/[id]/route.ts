import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { songs } from "@/src/db/schema";
import { getById, loadManifest } from '@/lib/premium-songs';
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.info('[api/song] GET hit', { id, url: request.url });
    
    const songResult = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    const song = songResult[0];

    if (!song) {
        console.info('[api/song] song not found in DB, trying premium manifest', { id });

        // Try to find a premade/premium song in the manifest (supports seed-format and legacy filename matches)
        try {
          // First try direct id match
          let prem = getById(id);
          if (!prem) {
            // Fallback: search manifest for filename/mp4/mp3 matches
            const manifest = loadManifest();
            const match = manifest.find((m: any) => {
              if (!m) return false;
              if (m.id && String(m.id) === String(id)) return true;
              // match by mp4/mp3 filename
              const candidates = [m.mp4, m.mp3, m.storageUrl, m.filename].filter(Boolean).map(String);
              for (const c of candidates) {
                try {
                  const parts = c.split('/');
                  const name = parts[parts.length - 1].replace(/\.[^.]+$/, '');
                  if (name === id || c === id) return true;
                } catch (e) {}
              }
              return false;
            });
            prem = match as any;
          }

          if (prem) {
            const p: any = prem;
            const storage = p.storageUrl || null;
            let fullUrl = p.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || p.mp3 || storage || null;
            let previewUrl = p.mp3 || fullUrl || '/audio/placeholder-preview.mp3';
            
            // Normalize template URLs: convert .mp3 to .mp4 for templates
            if (fullUrl && fullUrl.endsWith('.mp3')) {
              fullUrl = fullUrl.replace('.mp3', '.mp4');
            }
            if (previewUrl && previewUrl.endsWith('.mp3')) {
              previewUrl = previewUrl.replace('.mp3', '.mp4');
            }
            
            return NextResponse.json({
              success: true,
              song: {
                id: p.id || id,
                title: p.title || 'Premium Song',
                story: null,
                style: p.mode || p.musicStyle || null,
                lyrics: '',
                previewUrl,
                fullUrl,
                isPurchased: true,
                isTemplate: true,
                createdAt: null,
              }
            });
          }
        } catch (err) {
          console.warn('[api/song] premium manifest lookup failed', err);
        }

        console.info('[api/song] song not found', { id });
        return NextResponse.json(
          { success: false, error: "Song not found" },
          { status: 404 }
        );
    }

    // Normalize template URLs: convert .mp3 to .mp4 if needed
    let previewUrl = song.previewUrl;
    let fullUrl = song.isPurchased ? song.fullUrl : song.previewUrl;
    
    if (song.isTemplate) {
      if (previewUrl && previewUrl.endsWith('.mp3')) {
        previewUrl = previewUrl.replace('.mp3', '.mp4');
      }
      if (fullUrl && fullUrl.endsWith('.mp3')) {
        fullUrl = fullUrl.replace('.mp3', '.mp4');
      }
      // Ensure local paths start with /
      if (previewUrl && !previewUrl.startsWith('/') && !previewUrl.startsWith('http')) {
        previewUrl = `/${previewUrl}`;
      }
      if (fullUrl && !fullUrl.startsWith('/') && !fullUrl.startsWith('http')) {
        fullUrl = `/${fullUrl}`;
      }
    }
    
    console.info('[api/song] returning song', { id: song.id, isPurchased: song.isPurchased, hasFullUrl: !!song.fullUrl, previewUrl: !!previewUrl, isTemplate: song.isTemplate });
    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        story: song.story,
        style: song.style,
        lyrics: song.lyrics || '',
        previewUrl,
        fullUrl,
        isPurchased: song.isPurchased,
        isTemplate: song.isTemplate || false,
        createdAt: song.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

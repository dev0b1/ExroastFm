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

    // If we have a DB row but it's a template (preview MP3), prefer returning
    // a premade manifest entry (MP4) when we can map the previewUrl back to
    // a manifest item. This prevents the success page from showing the MP3
    // demo when a premium MP4 exists for the purchased song.
    if (song) {
      try {
        if (song.isTemplate && song.previewUrl) {
          const prem = getById(String(song.previewUrl)) || getById(String(song.previewUrl).split('/').pop() || '');
          if (prem) {
            const p: any = prem;
            const storage = p.storageUrl || null;
            const fullUrl = p.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || p.mp3 || storage || null;
            const previewUrl = p.mp3 || fullUrl || '/audio/placeholder-preview.mp3';
            return NextResponse.json({
              success: true,
              song: {
                id: p.id || song.id,
                title: p.title || song.title || 'Premium Song',
                story: null,
                style: p.mode || p.musicStyle || song.style || null,
                lyrics: '',
                previewUrl,
                fullUrl,
                isPurchased: true,
                isTemplate: true,
                createdAt: null,
              }
            });
          }
        }
      } catch (e) {
        console.warn('[api/song] template->manifest mapping failed', e);
      }
    }

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
            const fullUrl = p.mp4 || (storage && String(storage).toLowerCase().endsWith('.mp4') ? storage : null) || p.mp3 || storage || null;
            const previewUrl = p.mp3 || fullUrl || '/audio/placeholder-preview.mp3';
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

    console.info('[api/song] returning song', { id: song.id, isPurchased: song.isPurchased, hasFullUrl: !!song.fullUrl, previewUrl: !!song.previewUrl });
    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        story: song.story,
        style: song.style,
        lyrics: song.lyrics || '',
        previewUrl: song.previewUrl,
        fullUrl: song.isPurchased ? song.fullUrl : song.previewUrl,
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

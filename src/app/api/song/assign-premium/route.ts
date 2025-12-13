import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { songs, premiumSongs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { loadManifest } from '@/lib/premium-songs';

/**
 * Assigns a premium song to a purchased song record.
 * Fetches premium songs from database and matches based on story, style, and mode.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { songId, story, style, musicStyle } = body;

    if (!songId) {
      return NextResponse.json({ success: false, error: 'songId required' }, { status: 400 });
    }

    // Fetch the song from DB
    const songResult = await db.select().from(songs).where(eq(songs.id, songId)).limit(1);
    if (!songResult || songResult.length === 0) {
      return NextResponse.json({ success: false, error: 'song_not_found' }, { status: 404 });
    }

    const song = songResult[0];
    const songStory = story || song.story || '';
    const songStyle = style || song.style || '';
    const songMusicStyle = musicStyle || (song as any).musicStyle || song.genre || '';

    // Fetch premium songs from database
    const dbPremiumSongs = await db.select().from(premiumSongs);
    if (!dbPremiumSongs || dbPremiumSongs.length === 0) {
      return NextResponse.json({ success: false, error: 'no_premium_songs_available' }, { status: 500 });
    }

    // Also load manifest for better keyword matching
    const manifest = loadManifest();
    const manifestMap = new Map();
    manifest.forEach((m: any) => {
      const key = m.id || m.filename || '';
      if (key) manifestMap.set(key, m);
    });

    // Parse tags and extract mode/musicStyle from title or tags
    const premiumMapped = dbPremiumSongs.map((p: any) => {
      // Get manifest entry for better metadata
      const manifestEntry = manifestMap.get(p.id) || null;
      // Parse tags (stored as JSON string or comma-separated)
      // Prefer keywords from manifest if available
      let tagsArray: string[] = [];
      let keywords = '';
      
      // First try manifest keywords
      if (manifestEntry?.keywords) {
        keywords = manifestEntry.keywords;
        tagsArray = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      } else if (p.tags) {
        try {
          // Try parsing as JSON first
          if (p.tags.startsWith('{') || p.tags.startsWith('[')) {
            const parsed = JSON.parse(p.tags);
            tagsArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
          } else {
            // Comma-separated string
            tagsArray = p.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
          }
          keywords = tagsArray.join(',');
        } catch (e) {
          // If parsing fails, treat as comma-separated
          tagsArray = String(p.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
          keywords = tagsArray.join(',');
        }
      }

      // Extract mode and musicStyle - prefer manifest, then title/tags, then filename
      let mode: string | null = manifestEntry?.mode || null;
      let musicStyle: string | null = manifestEntry?.musicStyle || manifestEntry?.music_style || null;
      
      // If not in manifest, extract from title/tags/filename
      if (!mode || !musicStyle) {
        const titleLower = (p.title || '').toLowerCase();
        const allText = `${titleLower} ${keywords}`.toLowerCase();
        const idLower = (p.id || '').toLowerCase();
        const combinedText = `${allText} ${idLower}`.toLowerCase();
        
        const modes = ['petty', 'glowup', 'healing', 'savage', 'vibe', 'meme'];
        const styles = ['rap', 'pop', 'rnb', 'edm', 'rock'];
        
        if (!mode) {
          for (const m of modes) {
            if (combinedText.includes(m)) {
              mode = m;
              break;
            }
          }
        }
        
        if (!musicStyle) {
          for (const s of styles) {
            if (combinedText.includes(s)) {
              musicStyle = s;
              break;
            }
          }
        }
      }

      return {
        id: p.id,
        title: p.title || '',
        description: p.description || '',
        keywords,
        tags: tagsArray,
        mode,
        musicStyle,
        mp4: p.mp4 || null,
        mp3: p.mp3 || null,
        isPremium: true,
      };
    });

    // Match by mode and musicStyle first
    const songMode = songStyle.toLowerCase();
    const songMusicStyleLower = songMusicStyle.toLowerCase();

    // First, try to find premium candidates with exact mode/style match
    let premiumCandidates = premiumMapped.filter((p: any) => 
      ((p.mode || '').toLowerCase() === songMode) && 
      ((p.musicStyle || '').toLowerCase() === songMusicStyleLower)
    );

    // If no exact premium mode/style matches, relax to mode-only premium matches
    if (premiumCandidates.length === 0) {
      premiumCandidates = premiumMapped.filter((p: any) => (p.mode || '').toLowerCase() === songMode);
    }

    // If still no matches, use all premium songs
    if (premiumCandidates.length === 0) {
      premiumCandidates = premiumMapped;
    }

    // Score candidates by keyword overlap with story
    const scored = premiumCandidates.map((p: any) => {
      let score = 0;
      const storyLower = songStory.toLowerCase();
      const keywords = (p.keywords || '').split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean);
      
      for (const keyword of keywords) {
        if (storyLower.includes(keyword)) {
          score += 10;
        }
      }

      // Boost score if mode matches
      if (p.mode && p.mode.toLowerCase() === songMode) {
        score += 5;
      }

      // Boost score if musicStyle matches
      if (p.musicStyle && p.musicStyle.toLowerCase() === songMusicStyleLower) {
        score += 3;
      }

      return { song: p, score };
    });

    // Sort by score and pick the best match
    scored.sort((a, b) => b.score - a.score);
    const bestMatch = scored.length > 0 ? scored[0].song : premiumCandidates[0];

    if (!bestMatch) {
      return NextResponse.json({ success: false, error: 'no_premium_match_found' }, { status: 404 });
    }

    // Get the premium song URL from database
    // Priority: Use local file path from /public/premium-songs/ folder
    // If DB has external URL, convert to local path based on filename/id
    let finalFullUrl: string | null = null;
    let finalPreviewUrl: string | null = null;
    
    // Extract filename from id (e.g., "petty_rap_01.mp4" -> "petty_rap_01.mp4")
    const songId = bestMatch.id;
    const filename = songId.includes('.') ? songId : `${songId}.mp4`;
    
    // Prefer local file path from /public/premium-songs/ folder
    const localPath = `/premium-songs/${filename}`;
    finalFullUrl = localPath;
    finalPreviewUrl = localPath;
    
    // If local path doesn't work, fallback to DB mp4/mp3
    if (!finalFullUrl) {
      finalFullUrl = bestMatch.mp4 || null;
      finalPreviewUrl = bestMatch.mp3 || bestMatch.mp4 || null;
    }

    if (!finalFullUrl) {
      return NextResponse.json({ success: false, error: 'premium_song_no_url' }, { status: 500 });
    }

    // Normalize URL - ensure local paths start with /
    if (!finalFullUrl.startsWith('http://') && !finalFullUrl.startsWith('https://')) {
      if (!finalFullUrl.startsWith('/')) {
        finalFullUrl = `/${finalFullUrl}`;
      }
      if (finalPreviewUrl && !finalPreviewUrl.startsWith('/') && !finalPreviewUrl.startsWith('http')) {
        finalPreviewUrl = `/${finalPreviewUrl}`;
      }
    }

    // Update the song record with the premium song URL
    await db.update(songs).set({
      fullUrl: finalFullUrl,
      previewUrl: finalPreviewUrl || finalFullUrl,
      isPurchased: true,
      updatedAt: new Date(),
    }).where(eq(songs.id, songId));

    console.info('[assign-premium] assigned premium song', { 
      songId, 
      premiumSongId: bestMatch.id, 
      fullUrl: finalFullUrl,
      matchedMode: songMode,
      matchedStyle: songMusicStyleLower
    });

    return NextResponse.json({
      success: true,
      songId,
      premiumSongId: bestMatch.id,
      fullUrl: finalFullUrl,
      previewUrl: finalPreviewUrl,
      title: bestMatch.title,
    });
  } catch (error: any) {
    console.error('[assign-premium] error', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'internal_error' },
      { status: 500 }
    );
  }
}


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
      // Map by id (for DB lookup), filename (for file lookup), and normalized id
      const id = m.id || m.filename || '';
      const filename = m.filename || '';
      if (id) {
        manifestMap.set(id, m);
        // Also map by filename if different from id
        if (filename && filename !== id) {
          manifestMap.set(filename, m);
        }
        // Map by normalized id (without extension) for cases like "p1" -> "petty-pop.mp4"
        const idWithoutExt = id.replace(/\.[^.]+$/, '');
        if (idWithoutExt && idWithoutExt !== id) {
          manifestMap.set(idWithoutExt, m);
        }
        // Map by filename without extension too
        if (filename) {
          const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
          if (filenameWithoutExt && filenameWithoutExt !== id && filenameWithoutExt !== filename) {
            manifestMap.set(filenameWithoutExt, m);
          }
        }
      }
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
    // Priority: External URLs (from DB or manifest) > Local paths
    // External URLs work reliably, local paths may be blocked by middleware/routing
    let finalFullUrl: string | null = null;
    let finalPreviewUrl: string | null = null;
    
    const premiumSongId = bestMatch.id;
    let manifestEntry = manifestMap.get(premiumSongId);
    
    // If no direct manifest match, try to find a manifest entry with matching mode/style
    // This is important because DB might have "p1" but manifest has "petty_pop_01.mp4" with external URL
    if (!manifestEntry && bestMatch.mode && bestMatch.musicStyle) {
      const matchingManifest = manifest.find((m: any) => {
        const mMode = (m.mode || '').toLowerCase();
        const mStyle = (m.musicStyle || m.music_style || '').toLowerCase();
        return mMode === bestMatch.mode.toLowerCase() && 
               mStyle === bestMatch.musicStyle.toLowerCase();
      });
      if (matchingManifest) {
        manifestEntry = matchingManifest;
        console.info('[assign-premium] found manifest entry by mode/style match', {
          dbId: premiumSongId,
          manifestId: manifestEntry.id,
          manifestFilename: manifestEntry.filename,
          manifestStorageUrl: manifestEntry.storageUrl
        });
      }
    }
    
    // FIRST PRIORITY: Use DB mp4 if it's an external URL (these work reliably)
    if (bestMatch.mp4 && bestMatch.mp4.startsWith('http')) {
      finalFullUrl = bestMatch.mp4;
      finalPreviewUrl = bestMatch.mp3 || bestMatch.mp4;
      console.info('[assign-premium] using DB external mp4 URL', { fullUrl: finalFullUrl });
    }
    // SECOND PRIORITY: Use manifest entry's storageUrl if it's external (prefer external over local)
    // This handles cases where DB has local path but manifest has external URL
    else if (manifestEntry?.storageUrl && manifestEntry.storageUrl.startsWith('http')) {
      finalFullUrl = manifestEntry.storageUrl;
      finalPreviewUrl = finalFullUrl;
      console.info('[assign-premium] using manifest external storageUrl (preferred over local)', { 
        fullUrl: finalFullUrl,
        dbMp4: bestMatch.mp4,
        manifestFilename: manifestEntry.filename
      });
    }
    // THIRD PRIORITY: Use manifest filename for local file (if no external URLs available)
    else if (manifestEntry?.filename) {
      const filename = manifestEntry.filename;
      finalFullUrl = `/premium-songs/${filename}`;
      finalPreviewUrl = finalFullUrl;
      console.info('[assign-premium] using manifest filename for local file', { filename, fullUrl: finalFullUrl });
    }
    // FOURTH PRIORITY: Use DB mp4 if it's a local path (last resort for local)
    else if (bestMatch.mp4 && bestMatch.mp4.startsWith('/premium-songs/') && bestMatch.mp4.endsWith('.mp4')) {
      finalFullUrl = bestMatch.mp4;
      finalPreviewUrl = bestMatch.mp3 || bestMatch.mp4;
      console.info('[assign-premium] using DB local mp4 path', { fullUrl: finalFullUrl });
    }
    // FALLBACK: Construct from id (last resort)
    else {
      let filename = premiumSongId;
      if (!filename.includes('.')) {
        filename = `${filename}.mp4`;
      } else if (!filename.endsWith('.mp4')) {
        filename = filename.replace(/\.[^.]+$/, '.mp4');
      }
      finalFullUrl = `/premium-songs/${filename}`;
      finalPreviewUrl = finalFullUrl;
      console.warn('[assign-premium] fallback to constructed filename', { premiumSongId, filename, fullUrl: finalFullUrl });
    }
    
    console.info('[assign-premium] constructed path', { 
      premiumSongId: bestMatch.id, 
      dbMp4: bestMatch.mp4,
      finalFullUrl,
      isMp4: finalFullUrl?.endsWith('.mp4')
    });

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

    // Ensure the URL is an mp4 file
    if (!finalFullUrl.endsWith('.mp4') && !finalFullUrl.startsWith('http')) {
      // If it's a local path but not mp4, try to fix it
      if (finalFullUrl.includes('premium-songs')) {
        const baseName = finalFullUrl.split('/').pop() || '';
        if (!baseName.endsWith('.mp4')) {
          finalFullUrl = `/premium-songs/${baseName.replace(/\.[^.]+$/, '')}.mp4`;
          finalPreviewUrl = finalFullUrl;
        }
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
      isMp4: finalFullUrl.endsWith('.mp4'),
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


import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { songs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

// This matcher prefers templates that match the song's `style` (mode).
// Workflow:
// 1. Load `templates-data.json` (server-side JSON manifest)
// 2. Read the song row from DB to get `style`/`genre`/`story`
// 3. Filter templates by exact mode match, then score by keyword overlap
// 4. Fallback to a hash-based stable pick if nothing matches

async function loadTemplates() {
  try {
    const file = path.join(process.cwd(), 'templates-data.json');
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.templates || [];
  } catch (e) {
    console.debug('[matcher] failed to load templates-data.json', e);
    return [];
  }
}

function hashIndex(id: string | null | undefined, len: number) {
  if (!id || len <= 0) return 0;
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % len;
}

function normalizeText(s: string | undefined | null) {
  return (s || '').toLowerCase();
}

function scoreTemplate(template: any, song: any) {
  const hay = `${normalizeText(template.title)} ${normalizeText(template.description)} ${normalizeText(template.keywords)} ${((template.tags||[]) as string[]).join(' ').toLowerCase()}`;
  const needle = `${normalizeText(song.style)} ${normalizeText(song.genre)} ${normalizeText(song.story)} ${normalizeText(song.mood)}`;
  let score = 0;
  try {
    const hayWords = new Set(hay.split(/\W+/).filter(Boolean));
    const needleWords = new Set(needle.split(/\W+/).filter(Boolean));
    for (const w of needleWords) if (hayWords.has(w)) score++;
  } catch (e) {
    // ignore
  }
  // Small boost if mode exactly matches
  if (template.mode && song.style && template.mode.toLowerCase() === song.style.toLowerCase()) score += 5;
  return score;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const songId = url.searchParams.get('songId');

    const templates = await loadTemplates();

    // If no songId provided, fallback to deterministic pick
    if (!songId) {
      const idx = hashIndex(null, templates.length || 1);
      const t = templates[idx] || null;
      return NextResponse.json({ success: true, bestMatch: t?.id || null, sampleUrl: t?.storageUrl || null });
    }

    // Fetch song from DB to observe chosen style/mode
    const songResult = await db.select().from(songs).where(eq(songs.id, songId)).limit(1);
    const song = songResult && songResult[0];

    // If no song found, fallback to a stable deterministic pick
    if (!song) {
      const idx = hashIndex(songId, templates.length || 1);
      const t = templates[idx] || null;
      return NextResponse.json({ success: true, bestMatch: t?.id || null, sampleUrl: t?.storageUrl || null, note: 'song_not_found' });
    }

    // Prefer templates with exact mode match
    const songMode = (song.style || song.mode || '').toLowerCase();
    let candidates = templates.filter((t: any) => (t.mode || '').toLowerCase() === songMode);

    // If no exact mode match, try matching by tags/keywords
    if (candidates.length === 0) {
      const needle = `${normalizeText(song.style)} ${normalizeText(song.genre)} ${normalizeText(song.mood)} ${normalizeText(song.story)}`;
      candidates = templates.filter((t: any) => {
        const aggregate = `${normalizeText(t.keywords)} ${(t.tags||[]).join(' ').toLowerCase()} ${normalizeText(t.title)} ${normalizeText(t.description)}`;
        // simple substring match
        return needle.split(/\W+/).some(w => w && aggregate.includes(w));
      });
    }

    // Score candidates by keyword overlap and pick the highest
    let best: any = null;
    let bestScore = -1;
    const pool = (candidates.length > 0 ? candidates : templates);
    for (const t of pool) {
      const s = scoreTemplate(t, song);
      if (s > bestScore) { bestScore = s; best = t; }
    }

    // Final fallback: deterministic hash
    if (!best) {
      const idx = hashIndex(songId, templates.length || 1);
      best = templates[idx] || null;
    }

    return NextResponse.json({ success: true, bestMatch: best?.id || null, sampleUrl: best?.storageUrl || null, matchedMode: songMode });
  } catch (e) {
    console.error('[matcher] error', e);
    return NextResponse.json({ success: false, error: 'matcher_failed' }, { status: 500 });
  }
}

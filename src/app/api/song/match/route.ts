import { NextRequest, NextResponse } from 'next/server';
import { findBestMatches, loadManifest } from '@/src/lib/premium-songs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { story, style, excludeIds, limit } = body || {};

    const max = Number(limit) || 3;

    // Primary: use story-based scoring
    let matches = findBestMatches(story, Math.max(3, max * 2));

    // If manifest is empty or no matches, fallback to manifest sampling
    if (!matches || matches.length === 0) {
      const manifest = loadManifest();
      // shuffle and pick
      for (let i = manifest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [manifest[i], manifest[j]] = [manifest[j], manifest[i]];
      }
      matches = manifest;
    }

    // Filter excludes (preview-related) if provided
    const excludes = Array.isArray(excludeIds) ? excludeIds.map(String) : [];
    if (excludes.length > 0) {
      matches = matches.filter((m: any) => !excludes.includes(String(m.id)) && !excludes.includes(String(m.filename)));
    }

    // If after filtering nothing remains, repopulate from manifest and exclude nothing
    if (!matches || matches.length === 0) {
      matches = loadManifest();
    }

    // Trim to requested size
    const out = (matches || []).slice(0, max).map((m: any) => ({ id: m.id, title: m.title || null, mp4: m.mp4 || null, mp3: m.mp3 || null }));

    return NextResponse.json({ success: true, matches: out });
  } catch (err: any) {
    console.error('[song/match] error', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}

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

async function loadPremiumManifest() {
  try {
    const file = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed || [];
  } catch (e) {
    console.debug('[matcher] no premium manifest found', e);
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
  const hay = `${normalizeText(template.title)} ${normalizeText(template.description)} ${normalizeText(template.keywords)} ${((template.tags||[]) as string[]).join(' ').toLowerCase()} ${normalizeText(template.musicStyle)}`;
  const needle = `${normalizeText(song.style)} ${normalizeText(song.genre)} ${normalizeText(song.story)} ${normalizeText(song.mood)} ${normalizeText(song.musicStyle)}`;
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
    const premium = await loadPremiumManifest();

    // Normalize premium manifest entries into matcher-shaped objects
    const premiumMapped = (premium || []).map((p: any) => ({
      id: p.filename ? p.filename.replace(/\.[^.]+$/, '') : p.title,
      title: p.title || '',
      description: p.description || '',
      keywords: p.keywords || '',
      tags: p.tags || [],
      mode: p.mode || p.mode,
      musicStyle: p.musicStyle || p.music_style || p.style || '',
      storageUrl: p.storageUrl || p.storage_url || null,
      isPremium: true,
    }));

    // Combined pool: premium entries first (so we can prefer them when they score highest)
    const combinedPool = [...premiumMapped, ...(templates || [])];

    // If no songId provided, fallback to deterministic pick
    if (!songId) {
      const idx = hashIndex(null, combinedPool.length || 1);
      const t = combinedPool[idx] || null;
      return NextResponse.json({ success: true, bestMatch: t?.id || null, sampleUrl: t?.storageUrl || t?.storageUrl || null, isPremium: !!t?.isPremium });
    }

    // Fetch song from DB to observe chosen style/mode
    const songResult = await db.select().from(songs).where(eq(songs.id, songId)).limit(1);
    const song = songResult && songResult[0];

    // If no song found, fallback to a stable deterministic pick
    if (!song) {
      const idx = hashIndex(songId, combinedPool.length || 1);
      const t = combinedPool[idx] || null;
      return NextResponse.json({ success: true, bestMatch: t?.id || null, sampleUrl: t?.storageUrl || null, isPremium: !!t?.isPremium, note: 'song_not_found' });
    }

    // Prefer templates with exact mode match
    const songMode = (song.style || '').toLowerCase();
    const songMusicStyle = (((song as any).musicStyle) || ((song as any).music_style) || song.genre || '').toLowerCase();

    // First, try to find premium candidates with exact mode/style match
    let premiumCandidates = premiumMapped.filter((p: any) => ((p.mode || '').toLowerCase() === songMode) && ((p.musicStyle || '').toLowerCase() === songMusicStyle));

    // If no exact premium mode/style matches, relax to mode-only premium matches
    if (premiumCandidates.length === 0) {
      premiumCandidates = premiumMapped.filter((p: any) => (p.mode || '').toLowerCase() === songMode);
    }

    // If we found premium candidates, prefer scoring them first
    let candidates: any[] = [];
    if (premiumCandidates.length > 0) {
      candidates = premiumCandidates;
    } else {
      // Fallback: use template pool (including premium mapped items) filtered by mode
      candidates = combinedPool.filter((t: any) => (t.mode || '').toLowerCase() === songMode);
    }

    // Score candidates by keyword overlap and pick the highest
    let best: any = null;
    let bestScore = -1;
    const pool = (candidates.length > 0 ? candidates : combinedPool);
    for (const t of pool) {
      const s = scoreTemplate(t, song);
      if (s > bestScore) { bestScore = s; best = t; }
    }

    // Final fallback: deterministic hash
    if (!best) {
      const idx = hashIndex(songId, combinedPool.length || 1);
      best = combinedPool[idx] || null;
    }

    return NextResponse.json({ success: true, bestMatch: best?.id || null, sampleUrl: best?.storageUrl || null, isPremium: !!best?.isPremium, matchedMode: songMode, matchedStyle: songMusicStyle });
  } catch (e) {
    console.error('[matcher] error', e);
    return NextResponse.json({ success: false, error: 'matcher_failed' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

export type PremiumSong = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  mp3: string;
  mp4?: string;
  duration?: number;
};

const MANIFEST_PATH = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');

export function loadManifest(): PremiumSong[] {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    return JSON.parse(raw) as PremiumSong[];
  } catch (err) {
    console.error('[premium-songs] failed to load manifest', err);
    return [];
  }
}

export function findBestMatches(story: string | undefined, limit = 5): PremiumSong[] {
  const manifest = loadManifest();
  if (!story || story.trim().length === 0) return manifest.slice(0, limit);

  const words = story
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // simple scoring: count tag/title matches
  const scored = manifest.map((s) => {
    let score = 0;
    const hay = (s.tags || []).map((t) => t.toLowerCase()).concat([s.title.toLowerCase()]);
    for (const w of words) {
      for (const h of hay) {
        if (h.includes(w)) score += 1;
      }
    }
    return { song: s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).map((s) => s.song).slice(0, limit);
}

export function getById(id: string): PremiumSong | undefined {
  const manifest = loadManifest();
  if (!manifest || manifest.length === 0) return undefined;

  const normalizeName = (s?: string | null) => {
    if (!s) return null;
    try {
      const parts = String(s).split('/');
      const last = parts[parts.length - 1];
      return last.replace(/\.[^.]+$/, '');
    } catch (e) {
      return String(s).replace(/\.[^.]+$/, '');
    }
  };

  return manifest.find((m: any) => {
    if (!m) return false;
    // Prefer explicit `id` field
    if (m.id && String(m.id) === String(id)) return true;
    // Match filename (with or without extension)
    if (m.filename && (String(m.filename) === String(id) || normalizeName(m.filename) === String(id))) return true;
    // Match storageUrl basename
    if (m.storageUrl && (String(m.storageUrl) === String(id) || normalizeName(m.storageUrl) === String(id))) return true;
    // Match mp4/mp3 fields if present
    if (m.mp4 && (String(m.mp4) === String(id) || normalizeName(m.mp4) === String(id))) return true;
    if (m.mp3 && (String(m.mp3) === String(id) || normalizeName(m.mp3) === String(id))) return true;
    return false;
  }) as PremiumSong | undefined;
}

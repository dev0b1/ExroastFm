import fs from 'fs';
import path from 'path';

export type PremiumSong = {
  id: string;
  title?: string;
  description?: string | null;
  tags?: string[];
  mp3?: string | null;
  mp4?: string | null;
  storageUrl?: string | null;
  filename?: string | null;
  mode?: string | null;
  musicStyle?: string | null;
  duration?: number | null;
};

const MANIFEST_PATH = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');

/**
 * Load the manifest and normalize legacy/varied entry shapes into a stable
 * `PremiumSong` shape so callers can always prefer `mp4` when available.
 */
export function loadManifest(): PremiumSong[] {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(raw) as any[];
    if (!Array.isArray(parsed)) return [];

    const normalizeName = (s?: string | null) => {
      if (!s) return null;
      try {
        const parts = String(s).split('/');
        const last = parts[parts.length - 1] || parts[0];
        return last.replace(/\.[^.]+$/, '');
      } catch (e) {
        return String(s).replace(/\.[^.]+$/, '');
      }
    };

    return parsed.map((rawItem: any) => {
      const item = rawItem || {};
      const filename = item.filename || null;
      const storageUrl = item.storageUrl || null;

      // attempt to populate mp4/mp3 fields from common keys
      const explicitMp4 = item.mp4 || null;
      const explicitMp3 = item.mp3 || null;

      // If storageUrl looks like an mp4, treat it as mp4
      const storageIsMp4 = storageUrl && String(storageUrl).toLowerCase().endsWith('.mp4');
      const storageIsMp3 = storageUrl && String(storageUrl).toLowerCase().endsWith('.mp3');

      const mp4 = explicitMp4 || (storageIsMp4 ? storageUrl : null) || null;
      const mp3 = explicitMp3 || (storageIsMp3 ? storageUrl : null) || null;

      // Derive an id: prefer `id`, then filename base-name, then storage basename
      const derivedId = (item.id && String(item.id)) || normalizeName(filename) || normalizeName(storageUrl) || null;

      // Keywords -> tags
      let tags: string[] = [];
      if (Array.isArray(item.tags)) tags = item.tags.map(String);
      else if (typeof item.keywords === 'string') tags = item.keywords.split(',').map((s: string) => s.trim()).filter(Boolean);

      return {
        id: derivedId || String(Math.random()).slice(2),
        title: item.title || item.name || null,
        description: item.description || null,
        tags,
        mp3,
        mp4,
        storageUrl,
        filename,
        mode: item.mode || null,
        musicStyle: item.musicStyle || null,
        duration: item.duration || null,
      } as PremiumSong;
    }).filter(Boolean);
  } catch (err) {
    console.error('[premium-songs] failed to load manifest', err);
    return [];
  }
}

export function findBestMatches(style?: string | null, mode?: string | null, story?: string | undefined, limit = 5): PremiumSong[] {
  const manifest = loadManifest();
  if (!manifest || manifest.length === 0) return [];

  const norm = (s?: string | null) => (s || '').toLowerCase().trim();
  const desiredStyle = norm(style);
  const desiredMode = norm(mode);

  // If no inputs provided, return first N manifest entries
  if (!desiredStyle && !desiredMode && (!story || story.trim().length === 0)) return manifest.slice(0, limit);

  // Prepare story words if present
  const words = (story || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Scoring: prioritize exact mode/style matches with large weight,
  // then add story/tag/title overlap as a secondary score.
  const scored = manifest.map((s) => {
    let score = 0;
    try {
      const sMode = norm(s.mode);
      const sStyle = norm(s.musicStyle || s.musicStyle || s.mode);

      if (desiredMode && sMode && desiredMode === sMode) score += 100;
      if (desiredStyle && sStyle && desiredStyle === sStyle) score += 50;

      // story/title/tags matching (secondary)
      const hay = (s.tags || []).map((t) => String(t).toLowerCase()).concat([(s.title || '').toLowerCase(), (s.description || '').toLowerCase()]);
      for (const w of words) {
        for (const h of hay) {
          if (h && h.includes(w)) score += 1;
        }
      }
    } catch (e) {
      // ignore scoring errors
    }
    return { song: s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  // return top matches (including zero-scored if nothing else)
  return scored.map((s) => s.song).slice(0, Math.max(0, limit));
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

const fs = require('fs');
const path = require('path');
const MANIFEST = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');
function normalizeName(s){ if(!s) return null; try{ const parts = String(s).split('/'); const last = parts[parts.length-1]; return last.replace(/\.[^.]+$/, ''); } catch(e){ return String(s).replace(/\.[^.]+$/, ''); } }
try{
  const raw = fs.readFileSync(MANIFEST, 'utf8');
  const parsed = JSON.parse(raw);
  const out = parsed.map(item => {
    const filename = item.filename || null;
    const storageUrl = item.storageUrl || null;
    const explicitMp4 = item.mp4 || null;
    const explicitMp3 = item.mp3 || null;
    const storageIsMp4 = storageUrl && String(storageUrl).toLowerCase().endsWith('.mp4');
    const storageIsMp3 = storageUrl && String(storageUrl).toLowerCase().endsWith('.mp3');
    const mp4 = explicitMp4 || (storageIsMp4 ? storageUrl : null) || null;
    const mp3 = explicitMp3 || (storageIsMp3 ? storageUrl : null) || null;
    const derivedId = (item.id && String(item.id)) || normalizeName(filename) || normalizeName(storageUrl) || null;
    let tags = [];
    if (Array.isArray(item.tags)) tags = item.tags.map(String);
    else if (typeof item.keywords === 'string') tags = item.keywords.split(',').map(s => s.trim()).filter(Boolean);
    return { id: derivedId || String(Math.random()).slice(2), title: item.title || item.name || null, mp4, mp3, storageUrl, filename, tags };
  });
  const sample = out.find(o => o.id && o.id.includes('petty_pop_01'));
  console.log('normalized sample:', JSON.stringify(sample, null, 2));
} catch (err) {
  console.error('failed to read/normalize manifest', err);
}

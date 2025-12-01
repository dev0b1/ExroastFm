import fs from 'fs';
import path from 'path';
import { upsertPremiumSongs } from '../lib/db-service';

async function main() {
  const manifestPath = path.join(process.cwd(), 'public', 'premium-songs', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found at', manifestPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);
  const ok = await upsertPremiumSongs(manifest);
  if (!ok) process.exit(2);
  console.log('Imported', manifest.length, 'premium songs');
}

main().catch((err) => { console.error(err); process.exit(1); });

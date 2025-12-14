/**
 * Script to update database with Supabase Storage URLs from upload results
 * 
 * This script reads the premium-songs-upload-results.json file and updates
 * the database without re-uploading files.
 * 
 * Usage: npx tsx scripts/update-db-from-upload-results.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file (also try .env as fallback)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { readFile } from 'fs/promises';
import path from 'path';

const resultsPath = path.join(process.cwd(), 'premium-songs-upload-results.json');
const PREMIUM_SONGS_DIR = path.join(process.cwd(), 'public', 'premium-songs');

async function main() {
  console.log('🔄 Updating database with Supabase Storage URLs...\n');
  
  // Check if results file exists
  try {
    await readFile(resultsPath);
  } catch (e) {
    console.error(`❌ Results file not found: ${resultsPath}`);
    console.error('Please run: npm run upload:premium-songs');
    process.exit(1);
  }
  
  // Load upload results
  const resultsContent = await readFile(resultsPath, 'utf-8');
  const results: Array<{ filename: string; url: string | null }> = JSON.parse(resultsContent);
  
  const successful = results.filter(r => r.url !== null);
  
  if (successful.length === 0) {
    console.error('No successful uploads found in results file.');
    process.exit(1);
  }
  
  console.log(`Found ${successful.length} successful uploads\n`);
  
  // Load manifest to get metadata
  const manifestPath = path.join(PREMIUM_SONGS_DIR, 'manifest.json');
  let manifest: any[] = [];
  try {
    const manifestContent = await readFile(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  } catch (e) {
    console.warn('Could not load manifest.json, will match by filename only');
  }
  
  // Use the existing upsertPremiumSongs function
  const { upsertPremiumSongs } = await import('../lib/db-service.js');
  
  // Prepare data for upsert
  const songsToUpsert = successful
    .filter(r => r.url !== null)
    .map(result => {
      const filename = result.filename;
      const manifestEntry = manifest.find((m: any) => m.filename === filename);
      
      // Extract ID from filename (e.g., "petty_pop_01.mp4" -> "petty_pop_01")
      const id = filename.replace('.mp4', '');
      
      return {
        id: manifestEntry?.id || id,
        title: manifestEntry?.title || id.replace(/_/g, ' '),
        description: manifestEntry?.description || null,
        tags: manifestEntry?.keywords || manifestEntry?.tags || null,
        mp3: '', // Required field, but we don't have MP3s
        mp4: result.url!,
        duration: manifestEntry?.duration || 30,
      };
    });
  
  if (songsToUpsert.length > 0) {
    console.log(`Updating ${songsToUpsert.length} records in database...\n`);
    
    // Update in batches of 10 to avoid connection timeouts
    const BATCH_SIZE = 10;
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < songsToUpsert.length; i += BATCH_SIZE) {
      const batch = songsToUpsert.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(songsToUpsert.length / BATCH_SIZE);
      
      console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} records)...`);
      
      try {
        const success = await upsertPremiumSongs(batch);
        if (success) {
          updated += batch.length;
          batch.forEach(song => {
            console.log(`  ✓ ${song.id}: ${song.title}`);
          });
        } else {
          failed += batch.length;
          console.error(`  ✗ Batch ${batchNum} failed`);
        }
      } catch (error: any) {
        failed += batch.length;
        console.error(`  ✗ Batch ${batchNum} error:`, error.message);
      }
      
      // Small delay between batches to avoid overwhelming the connection
      if (i + BATCH_SIZE < songsToUpsert.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`✓ Updated: ${updated}`);
    console.log(`✗ Failed: ${failed}`);
    
    if (failed > 0) {
      console.error('\n⚠️  Some records failed to update. You may need to run this script again.');
      process.exit(1);
    } else {
      console.log(`\n✅ Successfully updated all ${updated} records in database!`);
    }
  } else {
    console.log('No successful uploads to update in database.');
  }
  
  console.log('\n✅ Done! Database updated with Supabase Storage URLs.');
}

main().catch(console.error);


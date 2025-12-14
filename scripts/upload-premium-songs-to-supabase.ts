/**
 * Script to upload premium song MP4 files to Supabase Storage
 * 
 * Usage:
 * 1. Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env.local
 * 2. Create a bucket named "premium-songs" in Supabase Storage (make it public)
 * 3. Run: npx tsx scripts/upload-premium-songs-to-supabase.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file (also try .env as fallback)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKET_NAME = 'premium-songs';
const PREMIUM_SONGS_DIR = path.join(process.cwd(), 'public', 'premium-songs');

async function uploadFile(filename: string): Promise<string | null> {
  try {
    const filePath = path.join(PREMIUM_SONGS_DIR, filename);
    const fileBuffer = await readFile(filePath);
    
    console.log(`Uploading ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true // Overwrite if exists
      });
    
    if (error) {
      console.error(`Error uploading ${filename}:`, error.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    console.log(`✓ Uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting upload to Supabase Storage...\n');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Directory: ${PREMIUM_SONGS_DIR}\n`);
  
  // Check if bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    process.exit(1);
  }
  
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.error(`❌ Bucket "${BUCKET_NAME}" does not exist!`);
    console.error('\nPlease create it in Supabase Dashboard:');
    console.error('  1. Go to Storage → Buckets');
    console.error(`  2. Create bucket named "${BUCKET_NAME}"`);
    console.error('  3. Make it PUBLIC');
    console.error('  4. Set file size limit to 50MB (or higher)');
    console.error('  5. Set allowed MIME types: video/mp4');
    process.exit(1);
  }
  
  // Get all MP4 files
  const files = await readdir(PREMIUM_SONGS_DIR);
  const mp4Files = files.filter(f => f.endsWith('.mp4'));
  
  if (mp4Files.length === 0) {
    console.error('No MP4 files found in', PREMIUM_SONGS_DIR);
    process.exit(1);
  }
  
  console.log(`Found ${mp4Files.length} MP4 files to upload\n`);
  
  const results: Array<{ filename: string; url: string | null }> = [];
  
  // Upload files one by one (to avoid overwhelming the API)
  for (const filename of mp4Files) {
    const url = await uploadFile(filename);
    results.push({ filename, url });
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Upload Summary:');
  const successful = results.filter(r => r.url !== null);
  const failed = results.filter(r => r.url === null);
  
  console.log(`✓ Successful: ${successful.length}`);
  console.log(`✗ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(`  - ${f.filename}`));
  }
  
  // Save results to a JSON file for reference
  const resultsPath = path.join(process.cwd(), 'premium-songs-upload-results.json');
  await import('fs/promises').then(fs => 
    fs.writeFile(resultsPath, JSON.stringify(results, null, 2))
  );
  
  console.log(`\n📄 Results saved to: ${resultsPath}`);
  
  // Step 2: Update database automatically
  console.log('\n🔄 Updating database with Supabase Storage URLs...\n');
  
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
    
    const success = await upsertPremiumSongs(songsToUpsert);
    
    if (success) {
      console.log(`\n✅ Successfully updated ${songsToUpsert.length} records in database!`);
      songsToUpsert.forEach(song => {
        console.log(`  ✓ ${song.id}: ${song.title}`);
      });
    } else {
      console.error('\n❌ Failed to update database. Check the error above.');
    }
  } else {
    console.log('No successful uploads to update in database.');
  }
  
  console.log('\n✅ Done! All files uploaded and database updated.');
}

main().catch(console.error);


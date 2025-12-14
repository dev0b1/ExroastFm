# Upload Premium Songs to Supabase Storage

Since the MP4 files are too large (1.3GB total) to commit to Git, we'll upload them to Supabase Storage instead.

## Step 1: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **Exroastai.fm**
3. Navigate to **Storage** → **Buckets**
4. Click **New bucket**
5. Configure:
   - **Name**: `premium-songs`
   - **Public bucket**: ✅ **Enable** (so videos are accessible)
   - **File size limit**: `50 MB` (or higher if needed)
   - **Allowed MIME types**: `video/mp4`
6. Click **Create bucket**

## Step 2: Set Up Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sfrolivcboneeqmurpze.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

To get your service role key:
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key (keep it secret!)

## Step 3: Upload Files

Run the upload script:

```bash
npm run upload:premium-songs
```

This will:
- ✅ Check if the bucket exists
- ✅ Upload all MP4 files from `public/premium-songs/`
- ✅ Show progress for each file
- ✅ Generate public URLs for each file
- ✅ Save results to `premium-songs-upload-results.json`

## Step 4: Update Database with URLs

After uploading, you need to update the `premium_songs` table in your database with the Supabase Storage URLs.

The script will create `premium-songs-upload-results.json` with all the URLs. You can then:

1. **Option A: Manual Update** - Update each record in Supabase Dashboard
2. **Option B: Use SQL** - Run an UPDATE query to set the `mp4` column
3. **Option C: Use the API** - Create a script to update via the API

### Example SQL Update:

```sql
-- Update petty_pop_01.mp4
UPDATE premium_songs 
SET mp4 = 'https://sfrolivcboneeqmurpze.supabase.co/storage/v1/object/public/premium-songs/petty_pop_01.mp4'
WHERE id = 'p1' OR mp4 LIKE '%petty_pop_01%';
```

## Step 5: Update Code to Use Supabase URLs

The `assign-premium` route already prioritizes external URLs (those starting with `http`), so once your database has Supabase Storage URLs, it will automatically use them!

## Troubleshooting

### "Bucket does not exist"
- Make sure you created the bucket in Step 1
- Check the bucket name is exactly `premium-songs`

### "Missing environment variables"
- Check your `.env.local` file
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key!)

### "Upload failed"
- Check file size (should be < 50MB per file)
- Check your Supabase Storage quota
- Try uploading one file at a time manually in the dashboard

## Benefits of Supabase Storage

✅ **No Git bloat** - Files stay out of version control  
✅ **CDN delivery** - Faster global access  
✅ **Automatic backups** - Supabase handles it  
✅ **Scalable** - Can handle unlimited files  
✅ **Public URLs** - Direct access without authentication  


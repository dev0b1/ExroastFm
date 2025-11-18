# 📦 Template Import Guide

## Overview

You have **two options** to add templates:

### Option 1: Local Storage (Simple) ✅ **RECOMMENDED FOR GETTING STARTED**
- MP3 files stored in `public/templates/`
- Metadata stored in PostgreSQL database
- Fast, simple, great for MVP
- Perfect for 5-50 templates

### Option 2: Supabase Storage (Scalable) 
- MP3 files stored in Supabase Storage bucket
- Metadata in PostgreSQL
- Better for 100+ templates or if disk space is limited
- Auto-upload feature

---

## 🚀 Quick Start: Local Storage

### Step 1: Prepare Your Data

Your data is already in `templates-data.json`:

```json
{
  "templates": [
    {
      "filename": "petty.mp3",
      "title": "Petty & Petulant",
      "keywords": "petty, sarcasm, attitude, call out, annoyed, frustrated, sass",
      "mode": "petty",
      "mood": "sarcastic",
      "duration": 35,
      "storageUrl": "templates/petty.mp3"
    },
    ...
  ]
}
```

**Edit this file to:**
- Add your template MP3 filenames
- Update keywords (comma-separated)
- Set mood/mode correctly
- Add descriptions

### Step 2: Add MP3 Files

Put your MP3 files in `public/templates/`:

```
public/templates/
├── petty.mp3
├── sad.mp3
├── healing.mp3
├── savage.mp3
└── vibe.mp3
```

**If you don't have MP3s yet, create placeholders:**
```bash
npm run templates:placeholders
```

### Step 3: Import to Database

```bash
npm run templates:import
```

Output:
```
📦 Template Import Tool (Local)
===============================

📄 Found 5 templates in JSON

🎵 Importing: Petty & Petulant
  ✅ Saved to database

🎵 Importing: Sad & Emotional
  ✅ Saved to database

... (and so on)

📊 Import Summary
================
✅ Created: 5
ℹ️  Skipped: 0
Total: 5

✨ Import complete!
```

### Step 4: Test in App

Visit `http://localhost:5000/story` and enter:
- "He cheated on me" → Matches to templates by keywords
- Should show 15-second preview of matched template

---

## 🌐 Advanced: Supabase Storage

Use this if you want:
- Auto-backup to cloud
- Serve files from CDN
- Scale to 100+ templates
- Better redundancy

### Setup Supabase Storage

1. **Create bucket in Supabase Console**
   - Go to: Storage → Buckets
   - Create bucket named: `templates`
   - Make it **Public** (so files are accessible)

2. **Set Policies** (in Supabase Console)
   - Go to: Authentication → Policies
   - Allow authenticated users to upload

### Import with Supabase

```bash
npm run templates:import-supabase
```

This will:
1. Read `templates-data.json`
2. Upload MP3s to `supabase.storage/templates/`
3. Save metadata to database
4. Use Supabase URLs in storage

---

## 📝 Editing templates-data.json

```json
{
  "templates": [
    {
      "id": "tpl_custom_001",
      "filename": "my-template.mp3",
      "title": "My Custom Template",
      "description": "What this template is about",
      "keywords": "word1, word2, word3, word4",
      "mode": "petty",  // or: sad, healing, savage, vibe
      "mood": "sarcastic",  // or: melancholic, hopeful, aggressive, upbeat
      "duration": 35,
      "tags": ["catchy", "funny"],
      "storageUrl": "templates/my-template.mp3"
    }
  ]
}
```

### Keyword Tips
- Use 5-10 keywords per template
- Think about what users would say/feel
- Examples:
  - Petty: "sarcasm, attitude, sass, funny, clever"
  - Sad: "heartbreak, tears, alone, missing, memories"
  - Healing: "strength, growth, moving on, empowerment"
  - Savage: "bold, direct, truth, no regrets, strong"
  - Vibe: "party, chill, freedom, fun, dancing"

### Mode & Mood
- **Mode**: petty | sad | healing | savage | vibe
- **Mood**: sarcastic | melancholic | hopeful | aggressive | upbeat

---

## 🔄 Workflow: Add More Templates Later

### To add templates:

1. **Edit `templates-data.json`** - add new entry
2. **Add MP3 file** to `public/templates/`
3. **Run import** - `npm run templates:import`

```bash
# Add to JSON, upload MP3, then:
npm run templates:import
```

The script will:
- Skip existing templates (by filename)
- Only add new ones
- Update database

---

## 🎯 Keyword Matching Algorithm

Your app uses string similarity to match user input to templates.

### Example

User enters: "He cheated and I'm so mad"

Algorithm:
1. Split into words: ["he", "cheated", "and", "i'm", "so", "mad"]
2. Compare to template keywords
3. Find best match (petty template has: "call out, annoyed")
4. Return that template

**Current templates:**
- `petty.mp3` - keywords: "petty, sarcasm, attitude, call out, annoyed, frustrated, sass"
- `sad.mp3` - keywords: "sad, heartbreak, missing, emotional, tears, alone, lonely"
- `healing.mp3` - keywords: "healing, strength, moving on, empowerment, growth, forward"
- `savage.mp3` - keywords: "savage, bold, strong, no regrets, truth, real, honest"
- `vibe.mp3` - keywords: "vibe, chill, freedom, fun, party, dancing, good times"

---

## 🧪 Testing

### Manual Test

```bash
npm run dev
```

Visit: `http://localhost:5000/story`

Enter stories and watch:
- Story gets matched to template
- Template preview plays (15 seconds)
- After preview, upsell modal appears

### Check Database

```bash
npm run db:push  # Make sure schema is in DB
npm run templates:import  # Import templates
```

Then query in Supabase console:
```sql
SELECT * FROM templates;
```

Should show:
```
id    | filename  | keywords                              | mode    | mood
------|-----------|---------------------------------------|---------|----------
xxx   | petty.mp3 | petty, sarcasm, attitude, call out... | petty   | sarcastic
xxx   | sad.mp3   | sad, heartbreak, missing, emotional.. | sad     | melancholic
...
```

---

## 🆘 Troubleshooting

### Import fails: "templates-data.json not found"
- Make sure `templates-data.json` is in root directory
- Run from project root: `npm run templates:import`

### Import fails: "Missing MP3 files"
- Create placeholders: `npm run templates:placeholders`
- Or add real MP3s to `public/templates/`

### Supabase upload fails
- Check Supabase credentials in `.env.local`
- Verify `templates` bucket exists and is public
- Check bucket policies allow uploads

### Templates not showing in app
- Verify they're in database: `SELECT * FROM templates;`
- Check keywords match user input
- Try entering exact keywords to test

### App can't find MP3 files
- Check file path in database `storageUrl`
- For local: should be `/templates/filename.mp3`
- For Supabase: should be full URL

---

## 📊 Local vs Supabase Comparison

| Feature | Local | Supabase |
|---------|-------|----------|
| **Setup Time** | 2 min | 5 min |
| **File Size Limit** | Server disk | 5GB per project |
| **Max Templates** | 50-100 | 1000+ |
| **Cost** | Free | ~$5/mo for storage |
| **CDN** | None | Included |
| **Auto Backup** | Manual | Automatic |
| **Best For** | MVP | Production Scale |

---

## 🎵 MP3 Specifications

### Recommended
- **Format**: MP3
- **Duration**: 30-35 seconds
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **File Size**: 400-800 KB

### How to Create
- Use Audacity (free)
- Export as MP3, select above settings
- Keep short (30-35s)
- Test in browser first

---

## 🚀 Production Checklist

- [ ] Created `templates-data.json` with all templates
- [ ] Added MP3 files to `public/templates/`
- [ ] Tested local import: `npm run templates:import`
- [ ] Verified templates show in database
- [ ] Tested keyword matching in app
- [ ] (Optional) Set up Supabase Storage for scale
- [ ] Updated keywords after testing
- [ ] Added more templates (scale to 10-20)

---

## 💡 Pro Tips

1. **Start with 5 templates** - Test matching before adding more
2. **Use descriptive keywords** - More keywords = better matching
3. **Keep MP3s under 1MB** - Faster loading
4. **Test each story entry** - Verify keyword matching works
5. **Plan for 50 templates** - Keep filenames organized (tpl_001, tpl_002, etc.)

---

## 📞 Need Help?

Check:
1. `IMPLEMENTATION.md` - Full setup guide
2. `QUICKSTART.md` - Quick reference
3. `.env.local` - Verify credentials
4. Database logs - Check import results


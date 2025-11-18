# Template Setup Guide

This guide explains how to add template MP3 files to ExRoast for free-tier users.

## Overview

Templates are pre-recorded, high-quality roast songs that free users can access. They're matched to the user's story using keyword matching.

- **Storage**: `public/templates/` (local files, served by Next.js)
- **Metadata**: `templates` table in Postgres (filename, keywords, mood, mode)
- **Access**: Free users match templates; Pro users get AI-generated songs

## File Structure

```
public/
  templates/
    petty-breakup.mp3                # 30-35 seconds
    ghosted-anthem.mp3               # 30-35 seconds
    healing-journey.mp3              # 30-35 seconds
    savage-confidence.mp3            # 30-35 seconds
    vibe-check.mp3                   # 30-35 seconds
    (add up to 50 total)
```

## Adding Templates

### Step 1: Add MP3 File

1. Find or create a high-quality 30-35 second roast song MP3 file
2. Name it descriptively: `{mood}-{description}.mp3`
   - Example: `petty-breakup.mp3`, `healing-empowerment.mp3`
3. Copy the MP3 to `public/templates/`

**Quality Requirements:**
- Format: MP3 (44.1kHz, 128kbps minimum)
- Duration: 30-35 seconds (matches `/api/generate-preview` limit)
- Volume: Normalized (no clipping)
- Instrumentation: Hip-hop, pop, or electronic (matches app vibe)

### Step 2: Add Metadata to Database

Edit `scripts/seed-templates.ts` and add an entry to `TEMPLATE_DATA`:

```typescript
{
  filename: 'petty-breakup.mp3',           // File name in public/templates/
  keywords: 'cheated, betrayal, angry',   // Comma-separated keywords (lowercase)
  mode: 'petty',                          // One of: petty, sad, savage, healing, vibe, meme
  mood: 'angry',                          // Description of mood (for display)
  storageUrl: '/templates/petty-breakup.mp3',
  title: 'Petty Breakup',                 // Display name
  description: 'A savage roast for when they cheated...',
}
```

**Keyword Guidelines:**
- Include specific story triggers: "cheated", "ghosted", "friends", "work"
- Include mood keywords: "angry", "sad", "empowering", "funny"
- 5-10 keywords per template
- Lowercase, comma-separated

### Step 3: Seed the Database

Run the seed script to insert metadata into the DB:

```bash
npm run db:seed
```

Or add a quick script in `package.json`:

```json
{
  "scripts": {
    "db:seed": "tsx scripts/seed-templates.ts"
  }
}
```

## How Templates Work

### Free User Flow:

1. User enters story on `/story` page
2. Clicks "Generate Roast"
3. Frontend calls `POST /api/generate-preview`
4. Backend:
   - Fetches all templates from DB
   - Calls `matchTemplate(story, style, templates)`
   - Scores each template by keyword overlap
   - Returns highest-scoring template
5. User sees preview page:
   - Plays template audio (15 seconds max)
   - Can share watermarked version
   - Upsell modal after 15 seconds

### Template Matching Algorithm:

```typescript
// Pseudo-code
score = 0
for each keyword in template.keywords:
  if keyword in user.story:
    score += 10                           // Exact match
  else if keyword similar to user.story:
    score += similarity * 5               // Fuzzy match
  
if template.mode == user.selected_style:
  score += 5                              // Mode bonus

return highest_score_template
```

**Example:**
- User's story: "He cheated with my best friend"
- Template 1 (keywords: "cheated, betrayal"): Score = 20 (both keywords match)
- Template 2 (keywords: "ghosted, heartbreak"): Score = 0
- Winner: Template 1 ✓

## Recommended Templates (5 for MVP Testing)

Here are 5 templates to start with (you can add up to 50 later):

| File | Mode | Keywords | Description |
|------|------|----------|-------------|
| `petty-breakup.mp3` | petty | cheated, betrayal, angry, savage | For cheating/betrayal stories |
| `ghosted-anthem.mp3` | sad | ghosted, abandoned, sad, heartbroken | For ghosting stories |
| `healing-journey.mp3` | healing | healing, moving on, strength, empowerment | For empowerment |
| `savage-confidence.mp3` | savage | savage, roast, diss, confidence, fierce | Generic savage roast |
| `vibe-check.mp3` | vibe | vibe, chill, funny, humor, meme | Funny/chill take |

## Adding Templates Incrementally

### Phase 1: MVP (5 templates)
- Cover basic moods: petty, sad, healing, savage, vibe
- Test matching accuracy
- Collect user feedback

### Phase 2: Expansion (15 templates)
- Add specific scenarios: "cheating", "ghosting", "long-distance", "timing"
- Add sub-moods: "playful" (vibe), "empowering" (healing), "cocky" (savage)
- Refine keyword coverage

### Phase 3: Scale (50+ templates)
- Cover edge cases
- Add seasonal/trending templates
- A/B test performance

## Testing Template Matching

### Test locally:

```bash
# 1. Add template files to public/templates/

# 2. Seed the database:
npm run db:seed

# 3. Dev server:
npm run dev

# 4. Visit http://localhost:5000/story

# 5. Try various stories and check which template matches:
# - "He cheated on me" -> should match 'petty-breakup' or similar
# - "They ghosted me" -> should match 'ghosted-anthem'
# - "I'm moving forward" -> should match 'healing-journey'
```

### Debug Matching:

Add console logs in `/api/generate-preview`:

```typescript
console.log('Fetched templates:', templates.length);
console.log('Template scores:', templates.map(t => ({
  filename: t.filename,
  score: matchTemplate(story, style, [t])?.score
})));
console.log('Selected template:', match?.template.filename);
```

## Storage Options

### Option 1: Local Files (Current) ✅
- **Pros**: Simple, no external costs, fast
- **Cons**: Limits scalability (server storage only)
- **Best for**: MVP, testing, <50 templates

### Option 2: Supabase Storage
- **Pros**: Scalable, CDN-backed, organized
- **Cons**: Additional setup, per-request costs
- **Best for**: Production, >100 templates
- **Setup**: See `SETUP_SUPABASE_STORAGE.md`

### Option 3: AWS S3 / Cloudflare R2
- **Pros**: Enterprise-grade, high availability
- **Cons**: Complex setup, higher costs
- **Best for**: Scale-phase (100+ templates, millions of users)

## FAQ

**Q: Can I test without real MP3 files?**
A: Yes! Create silent/placeholder MP3s for testing. Template matching will still work.

**Q: How long should templates be?**
A: 30-35 seconds (free tier is limited to 15s, but keep full length in DB).

**Q: Can I use existing songs?**
A: Legally, only if you have rights or license. For testing, use royalty-free music or create your own.

**Q: How do I update a template?**
A: Replace the MP3 file in `public/templates/` (URL stays the same).

**Q: What if keyword matching returns no match?**
A: Falls back to first template in DB. Always ensure at least one template exists per mode.

## Next Steps

1. ✅ Create 5 template MP3 files
2. ✅ Run seed script to add metadata
3. ✅ Test matching on `/story` page
4. ✅ Verify preview playback
5. ✅ Test sharing & watermark
6. 📈 Gather user feedback
7. 📈 Add more templates based on popular story patterns

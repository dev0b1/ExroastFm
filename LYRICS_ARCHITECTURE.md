# Lyrics Integration Architecture

## Recommended: AI-Generated Lyrics (Current Implementation)

Your app already uses OpenRouter API. Here's how lyrics are/should be generated:

### Current Architecture

```
User Story (text)
      ↓
Template Matching
      ↓
OpenRouter API Call (generate-song)
      ↓
[AI generates: lyrics + song audio]
      ↓
Store in Database (songs table)
      ↓
Display in Preview + Share
```

### Files Involved

1. **`src/app/api/generate-song/route.ts`**
   - Calls OpenRouter with user story
   - Should generate lyrics as part of response
   - Stores complete song data

2. **`src/db/schema.ts`**
   ```typescript
   lyrics: text('lyrics').notNull(),  // Already exists ✓
   ```

3. **`src/app/preview/preview-content.tsx`**
   ```typescript
   <LyricsOverlay 
     lyrics={song.lyrics}  // Uses stored lyrics
     duration={duration}
     isPlaying={isPlaying}
   />
   ```

### What Gets Generated (Per Song)

- Unique lyrics personalized to user's story
- Audio MP3 file
- Title/metadata
- Preview clip (first 15 seconds)

### Why This Works

1. **No Copyright Issues**
   - Each song is unique and AI-generated
   - User owns their generated content
   - No licensing needed

2. **Personalization**
   - Lyrics match the specific breakup story
   - Different every time
   - Each user gets unique content

3. **Scalability**
   - No hardcoded lyrics to maintain
   - Can generate unlimited unique songs
   - API-driven (can swap providers)

---

## Implementation Checklist

- [ ] Verify OpenRouter integration in `generate-song` route
- [ ] Confirm lyrics are in response from API
- [ ] Test end-to-end: Story → Generation → Preview → See lyrics
- [ ] Check database stores lyrics correctly
- [ ] Verify LyricsOverlay displays them properly

### Testing Command

```bash
# Start dev server
npm run dev

# Create a test song and check:
# 1. Lyrics appear in preview
# 2. Lyrics stored in database
# 3. Lyrics persist on refresh
```

---

## Database Query Example

```typescript
// Get song with lyrics
const song = await db
  .select()
  .from(songs)
  .where(eq(songs.id, songId))
  .limit(1);

// song.lyrics contains the full generated lyrics
console.log(song.lyrics);  // "I'm over you, yeah yeah..."
```

---

## Alternative: Manual Lyrics (Not Recommended)

If you wanted user-written lyrics:

```typescript
// POST /api/songs
{
  story: "They ghosted me",
  lyrics: "Ghosted after two years...",  // User provides
  style: "roast"
}
```

But AI-generated is better because:
- Takes load off users
- Guarantees quality
- Personalized to story
- Consistent with product

---

## What About Your `scripts/lyrics.txt`?

**Recommendation:** 
- Don't commit copyrighted lyrics to source
- If they're placeholder/example: Use them for testing only
- For production: Use AI-generated lyrics only

**If you need templates/examples:**
- Create a `docs/example-lyrics.txt` (for reference only)
- Use seed data in database for testing
- Never commit actual song lyrics to repo

---

## Integration Timeline

### Phase 1 (Now) ✓
- [x] Remove upload feature
- [x] Text-only input working
- [x] Build compiling successfully

### Phase 2 (Next)
- [ ] Verify lyrics generation in API
- [ ] Test full flow end-to-end
- [ ] Confirm database storage

### Phase 3 (Optional)
- [ ] Enhance lyrics display
- [ ] Add lyrics export
- [ ] Lyrics sharing feature

---

## Questions to Check

1. **Is OpenRouter generating lyrics?**
   - Check `src/app/api/generate-song/route.ts`
   - Look for prompt that asks for lyrics
   - Verify response includes lyrics field

2. **Are lyrics stored in database?**
   - Check song insert statement
   - Verify `lyrics` column is populated
   - Query database to confirm

3. **Are they displayed in preview?**
   - Check `LyricsOverlay` component
   - Test preview page
   - Verify lyrics appear and sync with audio

---

## Summary

Your app is now set up for **AI-generated, personalized lyrics** that:
- Are unique per song
- Match the user's story
- Have no copyright issues
- Scale infinitely
- Provide great UX

No need to manually manage lyrics - the AI does it! 🎵

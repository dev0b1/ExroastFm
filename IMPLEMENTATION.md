# Auth + Checkout + Templates Implementation Guide

This document explains the complete flow you just implemented:

```
User clicks "Subscribe"
    ↓
Not logged in? → Redirect to /login
    ↓
Google Auth (Supabase)
    ↓
Success → Redirect to /checkout?tier=premium
    ↓
Auto-open Paddle checkout
    ↓
Payment complete → /success page
```

---

## 1. Authentication Flow (Google via Supabase)

### What Changed:

**middleware.ts** - Now enabled
- Redirects unauthenticated users to `/login` if they try to access `/checkout`
- Preserves redirect URL for post-login navigation

**src/app/login/page.tsx** - NEW
- Beautiful login page with Google sign-in button
- Guest option (optional)
- Shows benefits of account (save roasts, manage subscriptions, etc.)

**src/app/auth/callback/route.ts** - NEW
- Handles OAuth callback from Google
- Exchanges auth code for session
- Redirects to `/checkout` if user came from subscribe button

### Prerequisites (Already Set Up in .env.local):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://sfrolivcboneeqmurpze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### User Journey:

1. User on pricing page → clicks "Subscribe"
2. No session? → Redirect to `/login?redirectTo=/checkout`
3. User clicks "Sign in with Google"
4. Google OAuth flow (browser redirects to Google, user logs in)
5. Google redirects back to `/auth/callback?code=...`
6. Backend exchanges code for session
7. Redirect to `/checkout` (from redirectTo param)
8. Checkout page auto-opens Paddle

---

## 2. Subscribe Button with Auth Redirect

### What Changed:

**components/SubscriptionCTA.tsx** - Updated
- Now checks if user is logged in
- If not logged in: Redirects to `/login?redirectTo=/checkout&tier={tierName}`
- If logged in: Opens Paddle checkout immediately

### Code Flow:

```typescript
const handleSubscribe = async (tier: SubscriptionTier) => {
  // Check if user is logged in
  if (!user) {
    // Not logged in - redirect to login
    router.push(`/login?redirectTo=/checkout&tier=${tier.id}`);
    return;
  }

  // User is logged in - open Paddle
  (window as any).Paddle.Checkout.open({
    items: [{ priceId: tier.priceId, quantity: 1 }],
    settings: { successUrl: `${origin}/success?tier=${tier.id}` },
  });
};
```

---

## 3. Auto-Redirect to Paddle After Login

### What Changed:

**src/app/checkout/page.tsx** - NEW
- Waits for user auth + Paddle SDK to load
- Auto-opens Paddle checkout
- Handles errors gracefully

### How It Works:

1. User lands on `/checkout?tier=premium`
2. Middleware redirects unauthenticated users to `/login`
3. User logs in, redirected back to `/checkout`
4. Checkout page:
   - Verifies user is logged in (Supabase session)
   - Waits for Paddle SDK to load (max 5s)
   - Gets tier from query params
   - Opens Paddle checkout automatically
   - No button click needed!

### Query Params:

```
/checkout?tier=premium          → Open Premium tier ($19/mo)
/checkout?tier=standard         → Open Standard tier ($9/mo)
/checkout?type=single           → Open single purchase ($9.99)
```

---

## 4. Template System for Free Users

### Architecture:

```
Free User Flow:
  1. Enter story → POST /api/generate-preview
  2. Backend fetches templates from DB
  3. Matches templates by keyword similarity
  4. Returns best match
  5. User sees 15-second preview
  6. Option to upgrade or share watermarked

Pro User Flow:
  1. Enter story → POST /api/generate-song
  2. OpenRouter generates brutal prompt
  3. Suno AI creates custom music
  4. User sees full 30-35 second song
```

### Local File Storage:

Templates are stored locally for simplicity:
- **Metadata**: `templates` table (filename, keywords, mode, mood)
- **Files**: `public/templates/` (MP3 files)
- **Served by**: Next.js static file server

### Template Metadata Structure:

```typescript
// templates table
{
  id: UUID,
  filename: "petty-breakup.mp3",          // File name
  keywords: "cheated,betrayal,angry",     // Comma-separated
  mode: "petty",                          // Song mood/style
  mood: "angry",                          // Display mood
  storageUrl: "/templates/petty-breakup.mp3",
  createdAt, updatedAt: timestamp
}
```

### Template Matching Algorithm:

```typescript
// From lib/template-matcher.ts
score = 0

For each keyword in template.keywords:
  if keyword in user.story:
    score += 10                           // Exact match
  else if similar(keyword, story_words):
    score += similarity * 5               // Fuzzy match (string-similarity pkg)

if template.mode == user.selected_style:
  score += 5                              // Bonus for matching mode

Return template with highest score
```

---

## 5. How to Add Templates

### Quick Start (5 templates for MVP):

#### Step 1: Generate Placeholders

```bash
npm run templates:placeholders
```

This creates minimal MP3 files in `public/templates/`:
- `petty-breakup.mp3`
- `ghosted-anthem.mp3`
- `healing-journey.mp3`
- `savage-confidence.mp3`
- `vibe-check.mp3`

#### Step 2: Replace with Real MP3 Files

1. Get or create real 30-35 second MP3 files
2. Replace files in `public/templates/`
3. Recommended: Use Audacity (free) to trim/edit + export as MP3

**Where to get audio:**
- YouTube Audio Library (free, royalty-free)
- Epidemic Sound (paid, high quality)
- Create with Suno AI (free API credits)

#### Step 3: Seed Database

```bash
npm run db:seed
```

This inserts template metadata into the `templates` table.

#### Step 4: Test

```bash
npm run dev
```

Visit `http://localhost:5000/story` and try:
- Enter "He cheated on me" → Should suggest petty-breakup template
- Enter "They ghosted me" → Should suggest ghosted-anthem template

### Incremental Growth:

**MVP Phase (Now):** 5 templates
- Test matching accuracy
- Gather user feedback
- Verify watermark + sharing works

**Growth Phase (Week 2-4):** 15 templates
- Add specific scenarios (cheating, ghosting, friends, timing)
- Add sub-moods (playful, cocky, empowering)
- Refine keyword coverage

**Scale Phase (Month 2+):** 50+ templates
- Cover all edge cases
- Add seasonal/trending templates
- A/B test performance

---

## 6. Setup Instructions

### Install Dependencies (Already Done):

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js @supabase/ssr
```

### Environment Variables (Already in .env.local):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Paddle
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_PADDLE_PRICE_STANDARD=pri_01...
NEXT_PUBLIC_PADDLE_PRICE_PREMIUM=pri_01...
NEXT_PUBLIC_PADDLE_PRICE_SINGLE=pri_01...

# Database
DATABASE_URL=...
```

### Google OAuth Setup in Supabase:

1. Go to **Supabase Dashboard** → Your Project
2. **Authentication** → **Providers** → Enable "Google"
3. Add Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Client ID + Secret from OAuth 2.0 keys
4. Set redirect URL to:
   ```
   http://localhost:5000/auth/callback  (development)
   https://yourdomain.com/auth/callback (production)
   ```

### Verify Setup:

```bash
npm run dev
```

Test flow:
1. Go to `http://localhost:5000/pricing`
2. Click "Subscribe" button
3. Should redirect to `/login`
4. Click "Sign in with Google"
5. Complete Google OAuth
6. Should auto-redirect to checkout
7. Paddle checkout opens automatically

---

## 7. File Structure

```
src/
  app/
    login/
      page.tsx                  ← Google sign-in page (NEW)
    checkout/
      page.tsx                  ← Auto-open Paddle (NEW)
    auth/
      callback/
        route.ts               ← OAuth callback handler (NEW)
    (other pages unchanged)

components/
  SubscriptionCTA.tsx           ← Updated: Checks auth before Paddle

public/
  templates/                     ← NEW directory for MP3 files
    petty-breakup.mp3
    ghosted-anthem.mp3
    healing-journey.mp3
    savage-confidence.mp3
    vibe-check.mp3

scripts/
  seed-templates.ts            ← Seed script (NEW)
  generate-template-placeholders.js ← Placeholder generator (NEW)

middleware.ts                   ← Updated: Auth enabled

TEMPLATE_SETUP.md              ← Setup guide (NEW)
```

---

## 8. Testing Checklist

### Authentication:
- [ ] Click "Subscribe" without logging in
- [ ] Redirected to `/login`
- [ ] Click "Sign in with Google"
- [ ] Google OAuth flow works
- [ ] After login, redirected to `/checkout`
- [ ] Paddle checkout opens automatically

### Templates:
- [ ] `npm run templates:placeholders` creates files
- [ ] `npm run db:seed` inserts metadata
- [ ] Free user enters story → Gets template preview
- [ ] Template matches story keywords
- [ ] Preview plays for 15 seconds then stops
- [ ] Upsell modal appears
- [ ] Share button works (watermarked)
- [ ] Pro user enters story → Gets AI song instead

### Checkout:
- [ ] Paddle checkout completes (sandbox mode)
- [ ] Webhook fires and updates DB
- [ ] Song unlocks after payment
- [ ] User can now download full MP3
- [ ] User becomes Pro (15s limit removed)

---

## 9. Troubleshooting

### "Middleware is blocking requests"
**Fix:** Ensure Supabase credentials in `.env.local` are correct

### "Google sign-in not working"
**Fix:** 
- Check Supabase Google provider is enabled
- Verify redirect URL is correct
- Check Google OAuth credentials

### "Paddle checkout doesn't open"
**Fix:**
- Wait 2+ seconds for Paddle SDK to load
- Check `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is set
- Verify price IDs are correct format (`pri_01...`)

### "Template doesn't match story"
**Fix:**
- Check keywords in DB vs. seed script
- Verify template filename matches `storageUrl`
- Check file exists in `public/templates/`

### "Free user gets 404 on MP3"
**Fix:**
- Run `npm run templates:placeholders`
- Verify files in `public/templates/`
- Check Next.js is serving static files

---

## 10. Next Steps

1. ✅ **Now**: Test auth + checkout flow
2. ✅ **Now**: Run `npm run templates:placeholders`
3. ✅ **Now**: Run `npm run db:seed` to populate template metadata
4. ✅ **Now**: Replace placeholder MP3s with real files
5. **Tomorrow**: Test full flow (auth → checkout → payment)
6. **This week**: Add 5-10 real templates based on testing
7. **Next week**: Integrate with your Suno/OpenRouter for AI generation

---

## Questions?

Check:
- `DEEP_DIVE.md` - Complete architecture overview
- `TEMPLATE_SETUP.md` - Template setup guide
- `README.md` - General project info

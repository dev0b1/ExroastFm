# ExRoast.buzz - Complete Architecture Deep Dive

**App**: AI-powered roast song generator for heartbroken users | **Tech**: Next.js 16 (App Router) + TypeScript + Tailwind + Drizzle ORM (Postgres) + Paddle Billing + Suno AI + OpenRouter LLM + Tesseract OCR

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Landing / Story Page                     │
│  Input: User's breakup story (text OR screenshot via OCR)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─→ Free User?      → /api/generate-preview (templates)
                     └─→ Pro User?       → /api/generate-song (AI-generated)
                            ↓
                  ┌─────────────────────┐
                  │  Preview Page       │
                  │  Play audio + Share │
                  │  (watermarked/full) │
                  └──────────┬──────────┘
                             │
                   ┌─────────▼────────────┐
                   │  Checkout (Paddle)  │
                   │  Success Page       │
                   └─────────────────────┘
```

---

## 2. Authentication & User Flow

### Current State: **Minimal Auth**
- **Middleware** (`middleware.ts`): Currently a **no-op**. Commented-out Supabase-based auth (ready to uncomment if needed).
- **Pro Status Check**: Via optional `x-user-id` header in `/api/user/pro-status` → returns `{ isPro, tier }`.
- **Subscription Status**: Stored in DB (`subscriptions` table) after Paddle webhook fires.
- **No explicit login**: Users are anonymous by default; identified only by Paddle transaction events.

### Authorization Flow:
```
1. User visits /story page
2. Frontend calls: GET /api/user/pro-status (no x-user-id header → defaults to free)
3. UI shows different endpoints based on isPro flag
   - Free: /api/generate-preview (template-based)
   - Pro:  /api/generate-song (AI-generated)
```

### Key Files:
- `middleware.ts` – Currently disabled; can be re-enabled for Supabase auth.
- `lib/auth-utils.ts` – `checkProStatus()` helper (async).
- `/api/user/pro-status` – Returns subscription tier (free/one-time/unlimited).
- `lib/db-service.ts` – `getUserSubscriptionStatus()` queries `subscriptions` table.

---

## 3. Payments (Dodo)

### Architecture:
1. **Frontend**: Minimal client integration — the app opens a server-created Dodo checkout URL. A dev-only `DodoConfigBanner` helps surface missing envs during development.
2. **Checkout Flow**: User clicks "Subscribe" → frontend calls our server `/api/checkout` endpoint which creates a Dodo checkout session and returns a redirect / checkout URL.
3. **Webhook**: Dodo POSTs to `/api/webhooks/payments` on transaction completion → server validates the webhook (signature/secret) → upserts `transactions` + `subscriptions` tables and stores the raw provider payload in `provider_data`.
4. **Success Page**: Redirects to `/success?tier={id}` after payment completion.

### Dodo Credentials (in `.env.local`):
```
DODO_PAYMENTS_API_KEY=xxx_sandbox_api_key
DODO_PAYMENTS_ENVIRONMENT=sandbox        # 'sandbox' or 'production'
DODO_PAYMENTS_RETURN_URL=https://your-app.example.com/checkout/return
NEXT_PUBLIC_DODO_PRODUCT_ID=prod_XXXX    # client-side product id used to build checkout
NEXT_PUBLIC_DODO_CHECKOUT_URL=https://checkout.dodo.example.com  # optional fallback
```

### Payment Tiers:
| Tier | Price | Limit | Features |
|------|-------|-------|----------|
| **Free** | $0 | 15s template previews | Matched templates, watermarked |
| **One-Time Pro** | $9.99 | 1 song | Full 30-35s custom AI song, no watermark, MP3 download |
| **Unlimited Pro** | $12.99/mo | Unlimited | Unlimited songs, screenshot upload → OCR → personalized, no watermark |

### Webhook Handler (`/api/webhooks/payments/route.ts`):
```typescript
1. Extract signature + body from request
2. Verify signature with Dodo webhook secret (reject invalid requests)
3. Insert transaction record: { id, songId, userId, amount, currency, status, provider_data }
4. Switch on eventType:
  - "transaction.completed" or equivalent → unlock song (set isPurchased=true)
  - "subscription.created" → upsert subscriptions table (populate `dodo_subscription_id`)
  - "subscription.updated" / "canceled" → update status
```

### Key Files:
- `components/DodoConfigBanner.tsx` – Dev helper that queries `/api/checkout/config` to show missing Dodo envs.
- `src/app/pricing/page.tsx` – Pricing page with tier cards.
- `components/SubscriptionCTA.tsx` – Checkout handler (server-driven for Dodo).
- `components/SubscriptionModal.tsx` – First-time upsell modal.
- `src/app/api/webhooks/payments/route.ts` – Dodo webhook verification & fulfillment (stores `provider_data`).
- `src/app/api/success/route.ts` (not shown) – Handles redirect after payment.

---

## 4. Roast Generation Flow

### User Journey:
1. User lands on `/story` page.
2. Selects input mode: **Text** or **Screenshot**.
3. **Text Mode**: Enters story (max 500 chars).
   - Submit → `/api/generate-song` (if Pro) or `/api/generate-preview` (if Free).
4. **Screenshot Mode** (Pro only):
   - Upload image → `/api/ocr` → extract text via Tesseract.js → use extracted text as story.
   - Submit extracted text → `/api/generate-song`.
5. Song generated → redirect to `/preview?songId={id}` → play, share, or upgrade.

### Generation Endpoints:

#### A. **`/api/generate-song`** (Pro only - AI-generated)
```typescript
Request: POST {
  story: string (min 10 chars),
  style: "petty" | "glowup" | "sad" | "savage" | "healing" | "vibe" | "meme"
}

Flow:
1. Validate story + style
2. Call OpenRouter (Mistral 7B) → generate { title, tags, prompt }
   - Prompt: "Create a brutal, hilarious 35s ex-roast"
3. Call Suno AI → generateSong(prompt, title, tags)
   - Polls for completion (60 attempts, 3s interval)
4. Insert song record: { title, story, style, lyrics, previewUrl, fullUrl }
5. Return { success, songId, title, lyrics }

Response: {
  success: true,
  songId: "uuid",
  title: "Petty Song Title",
  lyrics: "Full lyrics",
  message: "Song generated successfully"
}
```

**Fallback Logic**:
- OpenRouter fails? → Use template prompt.
- Suno fails? → Use `/audio/placeholder-full.mp3`.

#### B. **`/api/generate-preview`** (Free tier - template-based)
```typescript
Request: POST {
  story: string,
  style: string
}

Flow:
1. Fetch all templates from DB
2. Call matchTemplate(story, style, templates)
   - Score templates by keyword similarity (string-similarity package)
   - Return best match
3. Insert song record with isTemplate=true
4. Save to roasts table (for history)
5. Return { success, songId, isTemplate: true, matchScore }

Roast duration: 15 seconds (truncated in UI)
```

#### C. **`/api/ocr`** (Pro tier - screenshot text extraction)
```typescript
Request: POST FormData { image: File }

Flow:
1. Validate file type (must be image)
2. Convert to base64 data URL
3. Call Tesseract.recognize() (client-side OCR)
4. Clean extracted text:
   - Remove timestamps, emojis, status badges ("Read", "Delivered", "Sent")
   - Remove timestamps (HH:MM, dates)
   - Collapse multiple newlines
5. Validate chat screenshot (min 10 chars, min 5 words)
6. Return { success, rawText, cleanedText, confidence }

Response: {
  success: true,
  rawText: "...",
  cleanedText: "...",
  confidence: 0.95
}
```

### Key Files:
- `src/app/story/page.tsx` – Main roast creation UI.
- `src/app/api/generate-song/route.ts` – AI roast generation.
- `src/app/api/generate-preview/route.ts` – Template-based preview.
- `src/app/api/ocr/route.ts` – Screenshot OCR.
- `lib/openrouter.ts` – OpenRouter Mistral 7B client.
- `lib/suno.ts` – Suno AI music generation client.
- `lib/ocr.ts` – Tesseract.js OCR + text cleaning.
- `lib/template-matcher.ts` – Template keyword matching algorithm.

---

## 5. Database Schema (Drizzle ORM)

### Core Tables:

#### `users`
```typescript
{
  id: uuid (primary),
  email: text (unique),
  name: text,
  avatarUrl: text,
  createdAt, updatedAt: timestamp
}
```

#### `songs`
```typescript
{
  id: text (primary, uuid),
  title: text,
  story: text,
  style: text,
  lyrics: text,
  genre: text,
  mood: text,
  previewUrl: text (required),
  fullUrl: text (required),
  duration: int (default 30),
  isPurchased: boolean (default false),
  isTemplate: boolean (default false),
  purchaseTransactionId: text,
  userId: text,
  expiresAt: timestamp (optional),
  createdAt, updatedAt: timestamp,
  [Indexes]: userIdIdx, isPurchasedIdx, isTemplateIdx
}
```

#### `subscriptions`
```typescript
{
  id: uuid (primary),
  userId: uuid (unique),
  dodoSubscriptionId: text,
  tier: text ('one-time' | 'unlimited'),
  status: text (default 'active'),
  songsRemaining: int (default 0),
  renewsAt: timestamp,
  createdAt, updatedAt: timestamp,
  [Indexes]: userIdIdx
}
```

#### `transactions`
```typescript
{
  id: text (primary, from Paddle),
  songId: text (nullable),
  userId: text (nullable),
  amount: text,
  currency: text,
  status: text,
  paddleData: text (JSON stringified),
  createdAt: timestamp,
  [Indexes]: songIdIdx, userIdIdx
}
```

#### `roasts`
```typescript
{
  id: uuid (primary),
  userId: uuid (nullable),
  story: text,
  mode: text,
  title: text,
  lyrics: text,
  audioUrl: text,
  isTemplate: boolean (default false),
  createdAt: timestamp,
  [Indexes]: userIdIdx, createdAtIdx
}
```

#### `templates`
```typescript
{
  id: uuid (primary),
  filename: text,
  keywords: text (comma-separated),
  mode: text,
  mood: text,
  storageUrl: text (URL to audio),
  createdAt, updatedAt: timestamp,
  [Indexes]: modeIdx
}
```

### Helper Functions (`lib/db-service.ts`):
- `getAllTemplates()` – Fetch all templates.
- `getUserSubscriptionStatus(userId)` – Get `{ isPro, tier, subscriptionId }`.
- `createOrUpdateSubscription(userId, paddleData)` – Upsert subscription.
- `saveRoast(roastData)` – Insert roast record.
- `getUserRoasts(userId)` – Fetch user's roast history.

---

## 6. Data Flow: Complete End-to-End Example

### Scenario: Pro user roasts ex from screenshot

```
STEP 1: USER INPUT
  URL: /story
  Input Mode: Screenshot
  Screenshot: Chat between user & ex
  Style: "petty"

STEP 2: OCR EXTRACTION
  POST /api/ocr
    ├─ Tesseract extracts: "He ghosted me after saying he loved me. Then he posted pics with someone else."
    └─ Clean: Remove timestamps, emojis, status badges
  Response: { cleanedText: "He ghosted me..." }

STEP 3: SONG GENERATION (AI)
  POST /api/generate-song
    ├─ Story: "He ghosted me..."
    ├─ Style: "petty"
    │
    ├─ OPENROUTER (Mistral 7B):
    │   Prompt: "Create a brutal, hilarious 35s ex-roast [INSERT STORY]. Make it petty..."
    │   Response: {
    │       title: "Ghost Protocol",
    │       tags: "rap, petty, savage, TikTok",
    │       prompt: "35s savage rap about a guy who ghosted..."
    │   }
    │
    └─ SUNO AI:
        ├─ POST /create with prompt, title, tags
        ├─ Poll /get?id=taskId (60 times, 3s intervals)
        └─ Response: {
            id: "suno_id",
            audio_url: "https://...",
            lyrics: "...",
            duration: 35
        }

STEP 4: DATABASE PERSISTENCE
  INSERT songs {
    id: "uuid",
    title: "Ghost Protocol",
    story: "He ghosted me...",
    style: "petty",
    lyrics: "...",
    previewUrl: "https://suno.../preview.mp3",
    fullUrl: "https://suno.../full.mp3",
    duration: 35,
    isPurchased: false  // Will be true after Paddle webhook
  }
  Response: { success: true, songId: "uuid" }

STEP 5: PREVIEW PAGE
  URL: /preview?songId=uuid
  ├─ Fetch song from DB
  ├─ Display: Title, lyrics overlay, play button
  ├─ Audio: Plays full 35s (Pro has access)
  ├─ Share: TikTok pre-fill, download button
  └─ UI shows: "Already Purchased" or "Upgrade" CTA

STEP 6: ALREADY PURCHASED (Already Pro)
  → No Paddle checkout needed
  → Download MP3 button enabled
  → Share buttons active
```

### Scenario: Free user creates template preview

```
STEP 1: USER INPUT
  URL: /story
  Input Mode: Text
  Story: "He cheated with my best friend"
  Style: "petty"

STEP 2: TEMPLATE MATCHING (not AI)
  POST /api/generate-preview
    ├─ Fetch all templates
    ├─ matchTemplate(story, style, templates)
    │   ├─ Filter templates by style == "petty"
    │   ├─ Score by keyword similarity
    │   │   Checks: "cheated", "best friend", "heartbreak"
    │   └─ Return highest-scoring template
    │       Template: {
    │           id: "tmpl_1",
    │           storageUrl: "/uploads/templates/petty-betrayal.mp3",
    │           keywords: "cheated, friend, betrayal"
    │       }
    │
    └─ INSERT songs {
        title: "Petty Roast",
        story: "He cheated...",
        isTemplate: true,
        previewUrl: "/uploads/templates/petty-betrayal.mp3",
        isPurchased: false
    }

STEP 3: PREVIEW PAGE
  URL: /preview?songId=uuid
  ├─ Fetch song
  ├─ Play: 15 seconds (free tier limit, truncated by UI)
  ├─ After 15s: Stop playback + show SubscriptionModal
  │   "Love your song? Get unlimited for $9/month"
  └─ Share: Watermarked (can't download)

STEP 4: UPGRADE TO PRO
  User clicks "Subscribe" in modal
  ├─ handleSubscribe("unlimited")
  ├─ Call: Paddle.Checkout.open({
  │     items: [{ priceId: "pri_01xxx", quantity: 1 }],
  │     successUrl: "/success?tier=premium"
  │   })
  ├─ Paddle payment flow (Paddle-hosted checkout)
  └─ Success redirect

STEP 5: WEBHOOK (Paddle → Server)
  POST /api/webhook (from Paddle servers)
    ├─ Signature verification
    ├─ Parse eventType: "transaction.completed"
    ├─ Find song + user from custom_data
    ├─ UPDATE songs SET isPurchased = true, purchaseTransactionId = "tx_123"
    ├─ INSERT subscriptions (userId, dodoSubscriptionId, tier, status='active')
    └─ Return { received: true }

STEP 6: POST-PURCHASE
  User back on app (or visits preview again)
  ├─ GET /api/user/pro-status → { isPro: true, tier: 'unlimited' }
  ├─ Song now shows "Download" button (full audio)
  ├─ Can now upload screenshots (unlocked Pro feature)
  └─ Next roasts call /api/generate-song (AI)
```

---

## 7. External APIs & Dependencies

| Service | Purpose | Auth | Limits | Files |
|---------|---------|------|--------|-------|
| **Suno AI** | Music generation | `SUNO_API_KEY` in env | Rate limits (check dashboard) | `lib/suno.ts` |
| **OpenRouter** | LLM (lyrics/prompt) | `OPENROUTER_API_KEY` | Free credits (sign up) | `lib/openrouter.ts` |
| **Paddle** | Payment processing | Client token + API key | Webhook events | `components/PaddleLoader.tsx`, `/api/webhook` |
| **Tesseract.js** | OCR (browser) | None (open-source) | Browser memory | `lib/ocr.ts` |
| **PostgreSQL** (Neon) | Database | Connection string in env | DB limits | `server/db/index.ts` |

### Required `.env.local` Variables:
```bash
# Suno Music Generation
SUNO_API_KEY=xxx

# OpenRouter LLM
OPENROUTER_API_KEY=xxx

# Paddle Billing
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=xxx
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
PADDLE_API_KEY=xxx
PADDLE_NOTIFICATION_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_PADDLE_PRICE_STANDARD=pri_01xxx
NEXT_PUBLIC_PADDLE_PRICE_PREMIUM=pri_01yyy
NEXT_PUBLIC_PADDLE_PRICE_SINGLE=pri_01zzz

# Database
DATABASE_URL=postgresql://...

# Next.js (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:5000
```

---

## 8. Request/Response Shapes

### `/api/generate-song` (Pro)
```typescript
// REQUEST
{
  story: "He cheated on me after 3 years",
  style: "petty"
}

// RESPONSE (Success)
{
  success: true,
  songId: "550e8400-e29b-41d4-a716-446655440000",
  title: "Betrayal in HD",
  lyrics: "Verse 1: ...",
  message: "Song generated successfully"
}

// RESPONSE (Error)
{
  success: false,
  error: "Story is too short"
}
```

### `/api/generate-preview` (Free)
```typescript
// REQUEST
{
  story: "He ghosted me",
  style: "sad"
}

// RESPONSE (Success)
{
  success: true,
  songId: "uuid",
  title: "Sad Roast",
  message: "Template preview generated! Upgrade to Pro for personalized roasts.",
  isTemplate: true,
  matchScore: 8.5
}
```

### `/api/ocr` (Pro screenshot upload)
```typescript
// REQUEST (FormData)
FormData {
  image: File // .jpg, .png, .gif, etc.
}

// RESPONSE (Success)
{
  success: true,
  rawText: "He cheated on me\nRead 2:45 PM",
  cleanedText: "He cheated on me",
  confidence: 0.92
}

// RESPONSE (Error)
{
  success: false,
  error: "Not enough text detected. Please upload a clearer screenshot."
}
```

### `/api/webhook` (Paddle → Server)
```typescript
// PADDLE POSTS (internally verified)
{
  eventType: "transaction.completed",
  data: {
    id: "txn_123",
    status: "completed",
    amount: 1299,
    currency_code: "USD",
    custom_data: {
      songId: "uuid",
      userId: "user_123"
    },
    created_at: "2024-11-17T10:00:00Z"
  }
}

// SERVER RESPONSE
{
  received: true
}
```

### `/api/user/pro-status`
```typescript
// REQUEST
GET /api/user/pro-status
Headers: { 'x-user-id': 'user_123' }  // optional

// RESPONSE
{
  success: true,
  isPro: true,
  tier: "unlimited",
  userId: "user_123"
}
```

---

## 9. Key Decision Trees & Logic Flows

### Decision: Which endpoint to call?
```
User clicks "Generate"
  ├─ Check: isPro flag from /api/user/pro-status?
  │   ├─ YES → POST /api/generate-song (AI-generated, ~30-60s)
  │   └─ NO  → POST /api/generate-preview (template, instant)
  │
  └─ Screenshot upload triggered?
      ├─ YES & isPro → POST /api/ocr first, then /api/generate-song
      └─ NO or !isPro → Use story text directly
```

### Decision: Show upsell modal?
```
Song finishes playing
  ├─ Check: isPurchased && !isTemplate?
  │   ├─ YES → No modal (already paid)
  │   └─ NO  → Continue
  │
  ├─ Check: isTemplate?
  │   ├─ YES (free user) → Show upsell after 15s cutoff
  │   └─ NO → Continue
  │
  └─ Check: First time generating?
      ├─ YES → Show SubscriptionModal
      └─ NO → Show nothing (user already knows)
```

### Decision: Render UI element
```
Show "Download" button?
  ├─ song.isPurchased === true → YES
  └─ else → NO (grayed out)

Show "Share" buttons?
  ├─ song.isPurchased === true → YES, full-quality
  ├─ song.isTemplate === true → YES, watermarked
  └─ else → NO (disabled)
```

---

## 10. Common Workflows for Development

### Adding a New Song Style
1. Add style name to `SongStyle` type in `lib/lyrics.ts`.
2. Update OpenRouter prompt template in `lib/openrouter.ts` (add style description).
3. Update UI style selector in `components/StyleSelector.tsx`.
4. Optional: Add templates with matching `mode` in `templates` table.

### Testing Paddle Webhook Locally
1. Use Paddle's webhook dashboard → "Send Test Event" for your webhook URL.
2. Verify signature in `/api/webhook/route.ts` using test payload.
3. Check `transactions` table for new record.
4. Check `subscriptions` table for upserted subscription.

### Debugging Song Generation Failure
1. Check OpenRouter API response in logs (LLM failed?).
2. Check Suno API key + credits (music generation failed?).
3. API route falls back to placeholder audio (`/audio/placeholder-full.mp3`).
4. Template preview always works as fallback.

### Adding a New AI Client (e.g., ElevenLabs)
1. Create `lib/elevenlabs.ts` (mirror `lib/suno.ts` structure).
2. Update `/api/generate-song/route.ts` to use new client.
3. Export `createElevenLabsClient()` function.
4. Add `ELEVENLABS_API_KEY` to `.env.local`.

---

## 11. Performance & Scaling Considerations

| Component | Bottleneck | Solution |
|-----------|-----------|----------|
| **Suno polling** | 30-60s wait per song | Async job queue (Bull, Inngest). Currently blocks user. |
| **OCR processing** | Tesseract.js runs in browser | Can be slow on large images. Client-side only. |
| **Template matching** | O(n*m) string similarity | Works fine up to ~100 templates. Cache results if needed. |
| **Webhook processing** | Idempotency (duplicate events) | Already implemented: check `transactionId` uniqueness. |
| **Database queries** | Full table scans | Indexes on `userIdIdx`, `isPurchasedIdx` already in place. |

---

## 12. Troubleshooting & Known Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Paddle not initialized" | SDK loads slowly | Wait 2s before checkout. Script strategy: `afterInteractive`. |
| "Invalid Suno API key" | Wrong env var | Check `.env.local` `SUNO_API_KEY`. |
| "OpenRouter credits insufficient" | No free tier credits | Sign up, top up credits at openrouter.ai. |
| "OCR confidence low" | Poor screenshot quality | User should upload clearer image. |
| "Webhook signature invalid" | Wrong secret | Check `PADDLE_NOTIFICATION_WEBHOOK_SECRET` matches Paddle dashboard. |
| Song doesn't unlock after purchase | Webhook didn't fire | Check Webhook logs in Paddle dashboard + check DB for `transactions` record. |

---

## 13. File Structure & Key Paths

```
src/
  app/
    layout.tsx                         # Root layout (PaddleLoader injected here)
    page.tsx                           # Landing page
    story/page.tsx                     # Main roast creation flow
    preview/page.tsx                   # Song preview & upsell
    pricing/page.tsx                   # Pricing tiers
    api/
      generate-song/route.ts           # AI roast generation
      generate-preview/route.ts        # Template preview
      ocr/route.ts                     # Screenshot text extraction
      webhook/route.ts                 # Paddle webhook handler
      user/pro-status/route.ts         # Check subscription status
      song/[id]/route.ts               # Fetch song details
lib/
  openrouter.ts                        # LLM client (song prompts)
  suno.ts                              # Music generation client
  ocr.ts                               # Tesseract.js OCR + cleaning
  db-service.ts                        # DB helpers (query patterns)
  template-matcher.ts                  # Template keyword matching
  auth-utils.ts                        # Auth helpers (minimal)
  file-storage.ts                      # Local file upload helpers
components/
  PaddleLoader.tsx                     # Paddle SDK loader
  SubscriptionCTA.tsx                  # Checkout button
  SubscriptionModal.tsx                # Upsell modal
  StyleSelector.tsx                    # Style picker UI
  SocialShareButtons.tsx               # Share to TikTok/IG
  FileUpload.tsx                       # Screenshot upload
  LyricsOverlay.tsx                    # Lyrics display
  LoadingProgress.tsx                  # Generation progress
src/db/
  schema.ts                            # Drizzle ORM tables
```

---

## 14. How to Extend: Future Features

### Feature: User Profiles & History
- **DB**: Add `roasts` query in `lib/db-service.ts` → filter by `userId`.
- **Route**: Create `/api/user/roasts` → return user's roast history.
- **UI**: Add `/history` page to show past songs.

### Feature: Lyrics Editor
- **Route**: `POST /api/song/[id]/lyrics` → update `songs.lyrics`.
- **UI**: Add text editor in preview page.
- **DB**: Ensure `userId` matches before allowing edit (auth).

### Feature: Batch Generation (Multiple Styles)
- **API**: `POST /api/generate-songs/batch` with `{ story, styles: ['petty', 'healing'] }`.
- **Backend**: Loop over styles → call OpenRouter + Suno for each → return array of songs.
- **Cost**: Multiply generation cost. May need rate limiting.

### Feature: Referral Program
- **DB**: Add `referralCode`, `referrerId` to `users` table.
- **Route**: `POST /api/referral/apply` → upsert referrer bonus.
- **Paddle**: Use `custom_data` to pass `referrerId` in checkout.

---

## Summary

**ExRoast.buzz** is a **freemium Next.js app** that converts heartbreak stories into AI-generated roast songs:

- **Free tier**: Template-matched previews (15s, watermarked).
- **Pro tier**: AI-generated full roasts (30-35s, customizable, downloadable).
- **Payment**: Paddle Billings (subscriptions + one-time purchases).
- **Tech**: Suno AI (music) + OpenRouter LLM (lyrics) + Tesseract OCR (screenshots) + Drizzle ORM (Postgres).
- **Auth**: Minimal (anonymous by default, upgraded via Paddle webhook).
- **Key Flow**: Story input → OCR (optional) → LLM prompt → Suno music → DB save → Preview + upsell.

All generation is **async** (10-30s waits), fallback templates always available. Webhook ensures idempotent payment fulfillment.

---

**Generated**: 2024-11-17 | **Version**: 1.0

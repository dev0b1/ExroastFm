# ExRoast.buzz Deployment & Configuration Notes

## Known Limitations (MVP)

### 1. Audio Trimming
**Current Implementation:**
- Free users receive full template MP3 URLs (not trimmed to 15s)
- Client-side enforcement only: audio player pauses at 15 seconds
- Users cannot scrub past 15s, but technically could access full URL

**Why:**
- ffmpeg binary integration requires system-level dependencies not available in serverless/edge runtimes
- Trimming server-side would need:
  - Full Node.js runtime (not edge)
  - Persistent storage for trimmed files
  - Additional processing time and costs

**Security Mitigation:**
- Template `fullUrl` is intentionally set to empty string in database
- Only `previewUrl` is returned to free users
- Client enforces 15s limit with pause + reset to 0
- Upsell modal appears at 15s to prevent continued playback

**Future Improvement:**
- Use external service (Cloudflare Stream, AWS MediaConvert) for server-side trimming
- Or: Store templates as 15s files initially, full songs separately for pro users

### 2. Pro Status Detection
**Current Implementation:**
- Pro status check endpoint exists but requires Supabase keys to function
- Uses Supabase server helper to check auth session from cookies
- Without keys configured, all users default to free tier

**Setup Required:**
1. Add Supabase keys to environment
2. User must sign in via Google OAuth (or other provider)
3. Paddle webhook updates subscription status in Supabase `subscriptions` table
4. Pro status is read from this table on each request

**Testing Without Supabase:**
- Hard-code `isPro: true` in `/api/user/pro-status` for testing
- Or manually set pro status in localStorage for client-side testing

### 3. Admin Upload Security
**Current Implementation:**
- Requires authentication (Supabase login)
- Checks email against `ADMIN_EMAILS` environment variable
- Only whitelisted emails can upload templates

**Setup:**
Add to environment:
```
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Alternative for Testing:**
- Comment out admin email check in `/api/templates/upload`
- Or add your test email to whitelist
- Re-enable check before production

## Environment Variables Required

### Critical (App Won't Work Without These)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paddle Payments
PADDLE_CLIENT_TOKEN=your_paddle_token
PADDLE_API_KEY=your_paddle_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PADDLE_PRICE_SINGLE=pri_xxxxx
NEXT_PUBLIC_PADDLE_PRICE_UNLIMITED=pri_xxxxx

# Suno AI (for Pro tier)
SUNO_API_KEY=your_suno_key
```

### Optional But Recommended
```bash
# Admin access control
ADMIN_EMAILS=your-email@example.com

# OpenRouter (for lyric generation)
OPENROUTER_API_KEY=your_openrouter_key

# Database (if not using Supabase built-in)
DATABASE_URL=postgresql://...
```

## Testing Checklist

### Free Tier Flow
- [ ] User can create roast without signing in
- [ ] Template matching works with keywords
- [ ] Audio preview plays
- [ ] Preview pauses at 15 seconds
- [ ] Upsell modal appears after 15s
- [ ] localStorage stores last 3 roasts
- [ ] /history shows free roasts

### Pro Tier Flow (Requires Supabase + Paddle)
- [ ] User can sign in with Google OAuth
- [ ] Screenshot upload is enabled for pro users
- [ ] OCR extracts text from screenshots
- [ ] Full Suno API song generation works
- [ ] No watermark on pro songs
- [ ] Unlimited history saved in Supabase
- [ ] Paddle payment flow completes
- [ ] Webhook updates subscription status

### Admin Flow (Requires Auth + Email Whitelist)
- [ ] /admin requires login
- [ ] Non-admin users get 403 error
- [ ] Admin can upload MP3 templates
- [ ] Keywords are saved correctly
- [ ] Templates appear in free tier generation

## Production Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Paddle in live mode (not sandbox)
- [ ] At least 20 high-quality templates uploaded
- [ ] Template keywords cover common breakup scenarios
- [ ] Webhook URL points to production domain
- [ ] Admin email whitelist configured
- [ ] RLS policies enabled in Supabase
- [ ] Test end-to-end: free → pro → payment → full song
- [ ] Error monitoring configured (Sentry, LogRocket, etc.)
- [ ] Rate limiting on API routes
- [ ] CORS configured for Paddle checkout

## Cost Optimization

### Free Tier Costs
- **Templates**: One-time upload, stored in Supabase (~$0.021/GB)
- **Database**: Prisma/Postgres queries (free tier: 500MB, 2GB transfer)
- **Bandwidth**: Template audio delivery (Supabase: 50GB/month free)

### Pro Tier Costs
- **Suno API**: ~$0.10-0.20 per song generation
- **OpenRouter**: ~$0.01-0.03 per lyric generation
- **OCR**: tesseract.js runs client-side (free)
- **Supabase**: Scales with usage (paid plans start at $25/mo)

### Recommendations
- Cache template matches to reduce database queries
- Set reasonable rate limits (e.g., 5 generations/hour for free users)
- Monitor Suno API usage carefully
- Consider batching Supabase writes for history

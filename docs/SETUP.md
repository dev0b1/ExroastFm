# ExRoast.buzz Setup Guide

This guide will help you set up the freemium template system for ExRoast.buzz.

## Prerequisites

- Supabase account (free tier works)
- Paddle account for payments
- Suno API key for pro song generation

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (~2 minutes)

### Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL to create tables

### Create Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `templates`
3. Make it **public**
4. Set file size limit to 10MB
5. Set allowed MIME types: `audio/mpeg, audio/mp3`

### Get API Keys
1. Go to Project Settings → API
2. Copy these three values:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (keep this secret!)

### Add to Replit Secrets
Add these three secrets to your Replit project:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: The service_role key

## 2. Upload Template MP3s

### Using the Admin Panel
1. Go to `/admin` in your app
2. Upload MP3 files (15-30 seconds each)
3. Add keywords that users might mention (e.g., "ghost, ghosting, ghosted")
4. Select mode (petty, savage, sad, etc.)
5. Select mood (savage, emotional, etc.)
6. Click upload

### Recommended Templates
Create at least 10-20 templates covering common breakup scenarios:
- Ghosting (keywords: ghost, disappear, vanish, ignore)
- Cheating (keywords: cheat, affair, unfaithful, betrayed)
- Toxic behavior (keywords: toxic, manipulate, gaslight, narcissist)
- Moving on (keywords: heal, better, over, glow)
- Petty revenge (keywords: petty, revenge, karma, regret)

## 3. Paddle Payment Setup

### Create Products
1. Go to your Paddle dashboard
2. Create two products:
   - **One-Time Pro**: $9.99 one-time payment
   - **Unlimited Pro**: $12.99/month subscription
3. Copy the price IDs for each

### Configure Webhook
1. In Paddle, go to Developer Tools → Webhooks
2. Add your webhook URL: `https://your-app.replit.dev/api/webhook`
3. Select events:
   - `transaction.completed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
4. Copy the webhook secret

### Add to Replit Secrets
- `PADDLE_CLIENT_TOKEN`: Your Paddle client token
- `PADDLE_API_KEY`: Your Paddle API key
- `PADDLE_NOTIFICATION_WEBHOOK_SECRET`: Webhook secret
- `NEXT_PUBLIC_PADDLE_PRICE_SINGLE`: Price ID for $9.99 one-time
- `NEXT_PUBLIC_PADDLE_PRICE_UNLIMITED`: Price ID for $12.99/month

## 4. Testing the Flow

### Free User Flow
1. Go to `/story`
2. Enter a breakup story (text only)
3. Select a roast style
4. Click "Generate My Roast"
5. Wait for template matching
6. Preview should play 15s from matched template
7. Upsell modal appears after preview
8. Check `/history` - should see last 3 roasts in localStorage

### Pro User Flow (After Purchase)
1. Click upgrade in upsell modal
2. Complete Paddle payment (use test mode)
3. After payment, user gets full Suno AI song
4. Can upload screenshots for OCR-based roasts
5. `/history` shows all saved roasts
6. No watermark on songs

## 5. Troubleshooting

### Templates not matching
- Check that keywords in database match common words in user stories
- Use the `/admin` panel to add more keywords to existing templates
- Review template matching logic in `lib/template-matcher.ts`

### Supabase connection issues
- Verify all three secrets are set correctly
- Check Supabase project is not paused (free tier)
- Test connection with a simple query

### Payment not working
- Ensure Paddle is in test/sandbox mode during development
- Check webhook URL is publicly accessible
- Verify webhook secret matches

### OCR not working for pro users
- Check tesseract.js is installed: `npm list tesseract.js`
- Verify image is clear and has readable text
- Pro status must be active in subscriptions table

## 6. Production Checklist

Before deploying to production:

- [ ] Upload 20+ high-quality template MP3s
- [ ] Test all template keywords match user stories
- [ ] Switch Paddle to live mode
- [ ] Update Paddle webhook URL to production domain
- [ ] Enable Google OAuth in Supabase (optional)
- [ ] Set up proper error monitoring
- [ ] Test complete free → pro upgrade flow
- [ ] Verify webhook signature validation works
- [ ] Check RLS policies are enabled in Supabase
- [ ] Test OCR with real chat screenshots

## Support

For issues, check:
- Browser console for client errors
- Server logs for API errors
- Supabase logs for database issues
- Paddle dashboard for payment issues

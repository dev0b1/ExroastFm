# Breakup Song Generator - Replit Project

## Overview
A viral Next.js web application for generating personalized AI breakup songs with Paddle subscription billing, social sharing features, and emotional healing support. Built with Next.js 16, Tailwind CSS, Framer Motion, and Paddle Billing.

## Recent Changes (November 14, 2025)

### Latest Updates - Professional UI Redesign
- ✅ **Redesigned landing page** - Removed excessive pricing, focus on value and features
- ✅ **Created dedicated pricing page** (`/pricing`) with comprehensive tier comparison
- ✅ **Enhanced UI design** - Improved spacing, typography, card hover effects
- ✅ **Improved Paddle integration** - Better error handling and environment validation
- ✅ **Updated navigation** - Added "Get Started" button and pricing link in header
- ✅ **Next.js optimization** - Added image optimization and compression settings

### Initial Setup
- ✅ Initialized Next.js 16 project with App Router and TypeScript
- ✅ Configured Tailwind CSS with custom heartbreak color palette
- ✅ Created all core components (Header, Footer, StyleSelector, SongPlayer, SubscriptionCTA, LoadingAnimation, SocialShareButtons)
- ✅ Built landing page with animated broken heart and floating musical notes
- ✅ Created story input page with textarea and style selection (Sad, Savage, Healing)
- ✅ Built song preview page with audio player and subscription options
- ✅ Integrated Paddle.js for subscription checkout
- ✅ Added social share functionality for TikTok, Instagram, WhatsApp, Twitter
- ✅ Created API routes for song generation and retrieval
- ✅ Set up ElevenLabs Music API integration scaffolding

## Project Architecture

### Frontend
- **Next.js 16 App Router**: Modern React framework with server components
- **Tailwind CSS**: Utility-first styling with custom heartbreak theme
- **Framer Motion**: Smooth animations and transitions
- **React Icons**: Icon library for UI elements

### Pages
1. `/` - Landing page with hero, features, how it works, FAQ (pricing removed for cleaner UX)
2. `/pricing` - Dedicated pricing page with all subscription tiers and FAQs
3. `/story` - Story input and style selection
4. `/preview` - Song preview with payment options
5. `/success` - Payment confirmation page

### Components
- `Header` - Navigation with logo and links
- `Footer` - Links and social media
- `StyleSelector` - Choose song vibe (Sad/Savage/Healing)
- `SongPlayer` - Audio playback with controls
- `SubscriptionCTA` - Pricing tiers and checkout
- `LoadingAnimation` - Spinning musical notes animation
- `SocialShareButtons` - Share to social platforms
- `PaddleLoader` - Paddle.js SDK initialization

### API Routes
- `/api/generate-song` - POST endpoint for song generation
- `/api/song/[id]` - GET endpoint for song retrieval

## Paddle Billing Integration

### Subscription Tiers
- **Free**: $0 - 10-second previews, unlimited generations
- **Standard**: $9/month - 5 full songs, HD audio, MP3 downloads
- **Premium**: $19/month - 20 full songs, AI advice, no-contact tips, priority support
- **Single Song**: $2.99 - One-time purchase (optional alternative to subscriptions)

### Setup Instructions

1. **Create Paddle Account**
   - Sign up at https://www.paddle.com/
   - Complete account verification

2. **Create Products in Paddle Dashboard**
   - Create 3 subscription products (Standard, Premium, Single Song)
   - Note the Price IDs for each product

3. **Configure Environment Variables**
   Add these to your Replit Secrets:
   ```
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_client_token_here
   NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox (or "production")
   NEXT_PUBLIC_PADDLE_PRICE_STANDARD=pri_01xxxxx (your actual price ID)
   NEXT_PUBLIC_PADDLE_PRICE_PREMIUM=pri_01xxxxx (your actual price ID)
   NEXT_PUBLIC_PADDLE_PRICE_SINGLE=pri_01xxxxx (your actual price ID)
   PADDLE_API_KEY=your_api_key_here
   PADDLE_NOTIFICATION_WEBHOOK_SECRET=pdl_ntfset_xxxxx
   ```

4. **Set up Webhook**
   - In Paddle dashboard, go to Developer Tools > Webhooks
   - Add webhook URL: `https://your-replit-url.repl.co/api/webhook`
   - Select events: `transaction.completed`, `subscription.created`, `subscription.updated`, `subscription.canceled`

5. **Test in Sandbox Mode**
   - Use Paddle's test card numbers
   - Verify webhook events are received
   - Test subscription flows

### Error Handling
The app includes comprehensive error handling for Paddle:
- Validates environment variables before checkout
- Provides user-friendly error messages
- Logs errors to console for debugging
- Prevents checkout with invalid price IDs

## ElevenLabs Music API Integration

The app is scaffolded for ElevenLabs Music API integration. See `lib/elevenlabs.ts` for the integration points. When implementing:

1. Create an ElevenLabs account and get API key
2. Implement the `generateSong()` method in `lib/elevenlabs.ts`
3. Update `app/api/generate-song/route.ts` to call ElevenLabs API
4. Handle audio file storage and retrieval

## User Preferences
- Mobile-first responsive design
- Smooth animations using Framer Motion
- Heartbreak color palette (pale red, white, gray)
- Rounded, friendly fonts
- No placeholder data - production-ready code

## Dependencies
```json
{
  "@paddle/paddle-js": "^1.5.1",
  "next": "^16.0.3",
  "react": "^19.2.0",
  "tailwindcss": "^4.1.17",
  "framer-motion": "^12.23.24",
  "react-icons": "^5.5.0",
  "react-h5-audio-player": "^3.10.1",
  "clsx": "^2.1.1"
}
```

## Development
- Dev server runs on port 5000 (required for Replit webview)
- All hosts allowed for iframe compatibility
- TypeScript strict mode enabled

## Next Steps
1. Add ElevenLabs API key and implement song generation
2. Set up Paddle products and prices in dashboard
3. Configure webhook endpoint for subscription events
4. Test payment flow in sandbox mode
5. Add user authentication for song history
6. Implement download functionality for purchased songs

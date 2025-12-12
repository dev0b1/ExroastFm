```instructions
<!-- Copilot / AI agent quick-start for Breakup-music -->

# Quick orientation for code-writing agents

This is a Next.js 16 (App Router) TypeScript app that converts short user stories into "breakup songs" using external AI/music providers and persists metadata in Postgres via Drizzle. The short guidance below focuses on concrete, discoverable patterns and files to get you productive quickly.

Core architecture (big picture)
- Frontend: [src/app](src/app) — App Router pages and client components (React + Tailwind + Framer Motion). Key entry points: [src/app/story/page.tsx](src/app/story/page.tsx) and [src/app/checkout/page.tsx](src/app/checkout/page.tsx).
- Server/API: [src/app/api](src/app/api) — server route handlers that orchestrate prompt construction, provider clients, uploads, and DB writes. Key routes: [generate-song](src/app/api/generate-song/route.ts), [generate-preview](src/app/api/generate-preview/route.ts), and payment webhook handlers under [src/app/api/webhooks](src/app/api/webhooks).
- Database: Drizzle ORM. Canonical schema: [src/db/schema.ts](src/db/schema.ts). Import the generated table/types from this file and use `lib/db-service.ts` helpers for common patterns.
- Integrations: `lib/` contains provider clients (`lib/suno.ts`, `lib/openrouter.ts`, `lib/lyrics.ts`, `lib/file-storage.ts`). Pattern: small factory + a few focused methods (e.g., `generateAudio`, `generateLyrics`, `uploadFile`).

Key files to inspect before editing
- [src/app/api/generate-song/route.ts](src/app/api/generate-song/route.ts) — full generation path: prompt -> provider(s) -> upload -> DB insert (creates a `songs` row with `isPurchased=false`).
- [src/app/api/generate-preview/route.ts](src/app/api/generate-preview/route.ts) — cheaper preview generation.
- [src/app/api/webhooks/payments/route.ts](src/app/api/webhooks/payments/route.ts) — payment webhook verification and transaction persistence (high-risk area; do not change verification logic lightly).
- [src/db/schema.ts](src/db/schema.ts) — authoritative table and column names used across the repo.
- [lib/db-service.ts](lib/db-service.ts) — shared Drizzle helpers and example usages (`onConflict`, `returning`, `eq`, `desc`).
- Provider examples: [lib/suno.ts](lib/suno.ts), [lib/openrouter.ts](lib/openrouter.ts), [lib/lyrics.ts](lib/lyrics.ts), [lib/file-storage.ts](lib/file-storage.ts).

Developer workflows & exact commands
- Install: `npm install`
- Dev server: `npm run dev` (dev server is configured to run on port 5000: `next dev -p 5000 -H 0.0.0.0`).
- Build & start: `npm run build` && `npm run start`.
- Lint: `npm run lint`.
- Drizzle schema push: `npm run db:push` (uses `drizzle-kit`).
- Seed templates: `npm run db:seed` (runs `tsx scripts/seed-templates.ts`).
- Webhook testing: expose local server with `ngrok`/localtunnel to test `api/webhooks/payments` endpoints.

Environment & secrets (where to look)
- Payments: Dodo is the primary checkout provider. Key env vars include `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, `DODO_PAYMENTS_RETURN_URL`, and `NEXT_PUBLIC_DODO_PRODUCT_ID`.
- Provider keys: check each `lib/*.ts` for the exact env var names used for OpenRouter, Suno, OpenAI, ElevenLabs, etc.
- Local dev: ensure `DATABASE_URL` and provider API keys are set. Webhook verification depends on provider secrets — do not expose these in PRs.

Concrete data & control flows
- Generation: client POST `{ story, style }` → [generate-song/route.ts](src/app/api/generate-song/route.ts) builds prompt (helpers in `lib/openrouter.ts`), calls provider clients (e.g., `lib/suno.ts`), uploads via `lib/file-storage.ts`, then inserts into `songs` with preview+full URLs.
- Preview: similar but uses the preview path [generate-preview/route.ts](src/app/api/generate-preview/route.ts) to reduce cost and latency.
- Purchase fulfillment: frontend initiates checkout → payments provider (Dodo) calls webhook → webhook writes `transactions` and marks `songs.isPurchased = true` and sets `purchaseTransactionId`.

Conventions & repository patterns
- API handlers: use App Router server functions that return `NextResponse` and perform input validation early.
- DB access: always import table definitions from [src/db/schema.ts](src/db/schema.ts) and reuse helpers from [lib/db-service.ts](lib/db-service.ts).
- Provider clients: keep them thin; mirror existing clients' error handling and retry/fallback semantics.
- Error handling: preserve defensive fallbacks present in `generate-song/route.ts` (fallback prompts, placeholder audio URLs).

Safety & high-risk areas
- Payment webhooks and transaction persistence: avoid changing verification/fulfillment logic without tests and coordination with payments owners.
- Schema changes: migrating column names or types requires running `npm run db:push` and updating seeds (`npm run db:seed`).

How to add an integration (practical steps)
1. Add `lib/<provider>.ts` following `lib/suno.ts` style: export factory + focused methods.
2. Add usage in an API handler under `src/app/api/*` and follow prompt -> provider -> upload -> DB insert sequence.
3. Add env var names to README/SETUP, update `env.example` if present, and include fallback behavior for failures.

If unsure
- Open a focused PR, reference the exact files you modified, and include instructions for how to test locally (e.g., ngrok for webhooks, which seed/data to insert).

— End of Copilot instructions

```

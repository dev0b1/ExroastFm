<!-- Copilot / AI agent quick-start for Breakup-music -->

# Quick orientation for code-writing agents

This repo is a Next.js 16 (App Router) TypeScript web app that generates short "breakup songs" using AI generation clients and persists metadata to Postgres via Drizzle. The goal of this file is to point you to the exact places and patterns you need to safely implement features and PRs.

Core architecture (big picture)
- Frontend: `src/app` (Next.js App Router, React + Tailwind + Framer Motion). UI pages call internal API routes to request generation and purchases (examples: `src/app/story/page.tsx`, `src/app/checkout/page.tsx`).
- API & server logic: `src/app/api/*` — Next server routes (exported handlers like `export async function POST(request)`). Key routes: `generate-song`, `generate-preview`, `webhook`.
- Database: Drizzle (schema in `src/db/schema.ts`). Tables: `users`, `songs`, `subscriptions`, `transactions`, `roasts`, `templates`. Use schema types for queries.
- Integrations & generators: `lib/` — thin wrapper clients live here (e.g. `lib/suno.ts`, `lib/openrouter.ts`, `lib/lyrics.ts`, `lib/file-storage.ts`). These export concise functions used by API routes.

Key files to read before editing
- `src/app/api/webhook/route.ts` — Paddle webhook verification and transaction persistence; follow its signature verification and fulfillment flow exactly.
- `src/app/api/generate-song/route.ts` — main flow: prompt generation (OpenRouter), fallback prompt, music via Suno client, DB insert into `songs`.
- `src/db/schema.ts` — canonical table/column names. Always reference these types in queries.
- `lib/db-service.ts` — helper query patterns and examples of Drizzle usage (onConflict, returning, eq, desc).
- `lib/*.ts` — follow client wrapper patterns when adding new providers (export a factory + `generateX` functions).

Developer workflows & exact commands
- Install dependencies: `npm install`
- Run dev server: `npm run dev` (starts Next on port 5000: `next dev -p 5000 -H 0.0.0.0`).
- Build & start: `npm run build` / `npm run start` (start binds to port 5000).
- Lint: `npm run lint` (Next's lint integration).
- DB push & seed: `npm run db:push` (drizzle-kit push), `npm run db:seed` (runs `tsx scripts/seed-templates.ts`).

Environment variables (discoverable from code)
- Core: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_NOTIFICATION_WEBHOOK_SECRET`, `NEXT_PUBLIC_PADDLE_ENVIRONMENT` (webhook signature verification depends on these).
- Provider keys used by `lib/*`: OpenRouter/Suno/OpenAI/ELEVENLABS (if added). Check `lib/*` for exact env var names.

Data & control flow notes (examples)
- Generation flow (from `generate-song/route.ts`): request body { story, style } → prompt via OpenRouter → generate audio via Suno → insert row into `songs` with previewUrl/fullUrl and isPurchased=false.
- Purchase flow: frontend posts to Paddle; webhook handler (`/api/webhook`) unmarshals and stores to `transactions`, then calls handlers (e.g., `handleTransactionCompleted`) to set `songs.isPurchased = true` and `purchaseTransactionId`.

Conventions & patterns to follow (repo-specific)
- API routes: prefer Next App Router handlers (`export async function POST(request)`) and return NextResponse.
- DB: import tables from `src/db/schema.ts` and use `db` from `server/db` or helpers in `lib/db-service.ts`.
- Generator clients: keep thin wrappers in `lib/`. If adding a new provider (e.g., ElevenLabs), mirror the factory + methods pattern used by `lib/suno.ts` and call from API routes.
- Feature flags / fallbacks: routes often include safe fallbacks (see `generate-song/route.ts` fallback prompt and music placeholders). Preserve this defensive style where network calls can fail.

What not to change without approval
- Webhook signature/verification logic and transaction persistence flow — changing here can break payment fulfillment.
- Drizzle schema types and column names — many queries rely on exact column names (e.g., `isPurchased`, `purchaseTransactionId`).

PR & debugging tips
- To exercise generation: use UI at `/story` (posts to `/api/generate-song` or `/api/generate-preview`).
- To test webhooks locally: craft test payloads and pass them through the same verification/unmarshal flow used in `src/app/api/webhook/route.ts`.
- DB migrations: use `npm run db:push` for schema pushes and `npm run db:seed` to populate templates.

If you add integrations
- Add the client under `lib/` with the same export style used by existing clients. Update API routes that call generator clients and add required env vars to README/SETUP docs.

If something here is unclear, leave a focused comment in a PR describing the unknown and link the route/file that relies on it (e.g., `generate-song/route.ts`, `webhook/route.ts`, `src/db/schema.ts`).

— End of Copilot instructions

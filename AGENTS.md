# Zain OS — Agent Rules

You are building **Zain OS**, a single-user accountability PWA. It's organised around five salah checkpoints, one forgiving streak, a daily "Big Rock" deep-work block, an evening muhasaba + plan, and an AI coach. The user is Zain, a Muslim founder in Karachi.

## Read these first, in order
1. `docs/06_PHASE1_KICKOFF.md` — what to build now, milestones and acceptance criteria
2. `docs/01_PRODUCT_SPEC.md` — screens, streak engine, notifications, data model, phases
3. `docs/03_DESIGN.md` — visual system (tokens, type, components, motion)
4. `docs/04_SEED_DATA.md` — the exact routine, habits, blocks, meetings and notification rules to seed
5. `docs/05_CONTENT.md` — static copy: duas (Arabic + meaning), laws, milestone and notification text
6. `docs/02_SYSTEM.md` — background on *why* the system works this way (read-only context)
7. `docs/reference/playbook.html` — visual and content reference; the library data lives in its `B` array

**If documents conflict:** PHASE1_KICKOFF > PRODUCT_SPEC > DESIGN > SEED_DATA > SYSTEM.
**If something is unclear:** pick the simplest option that satisfies the spec, write the assumption in `docs/DECISIONS.md`, and continue.

## Stack (fixed; do not substitute)
- **Next.js 16** App Router · React · **TypeScript strict** · pnpm
- **Tailwind CSS v4** + **shadcn/ui** (Radix) · **Motion** (`motion/react`) · lucide-react
- `next/font`: Cormorant Garamond (display), system UI stack (body), JetBrains Mono (numbers/times), Amiri (Arabic)
- **Supabase**: Postgres, RLS, Auth (email magic link), `pg_cron`, `pg_net`; `@supabase/ssr`
- **TanStack Query** (optimistic updates) + an IndexedDB queue (`idb-keyval`) for offline taps
- **Serwist** service worker (`@serwist/turbopack`) + `app/manifest.ts`
- `web-push` (VAPID) · `adhan` · `date-fns` + `@date-fns/tz`
- Claude API (`@anthropic-ai/sdk`, server-only) for the coach (Phase 2)
- Vitest for unit tests · deploy on **Vercel**

## Project structure
```
app/
  (auth)/login/page.tsx
  (app)/layout.tsx            # bottom tab bar: Today · Streaks · Plan · Coach
  (app)/today/page.tsx
  (app)/streaks/page.tsx
  (app)/plan/page.tsx
  (app)/coach/page.tsx        # Phase 2 (placeholder in Phase 1)
  api/cron/dispatch/route.ts  # every minute (pg_cron): send due notification_queue rows
  api/cron/daily/route.ts     # ?job=build (00:05 PKT) | ?job=close (03:00 PKT)
  api/push/subscribe/route.ts
  manifest.ts
  sw.ts                       # Serwist: precache, push, notificationclick
lib/
  supabase/{server,client,admin}.ts
  time.ts                     # Karachi clock, logical day (closes 03:00), week/cycle math
  prayer.ts                   # adhan + masjid offsets → azan & jamaat times
  streak.ts                   # PURE streak engine
  schedule.ts                 # PURE: day's notifications from prayer times + plan + state
  push.ts
  content/{duas,laws,milestones,library}.ts
components/                   # one component per file; shadcn primitives in components/ui
supabase/migrations/          # schema, RLS, functions, cron jobs, seed
tests/                        # vitest: streak.test.ts, schedule.test.ts, time.test.ts
```

## Always
- **Server Components by default.** Use `'use client'` only for interaction. Writes go through Server Actions (or route handlers for cron/push).
- **RLS on every table**, owner-only policies on `auth.uid()`. The service-role client exists only in `lib/supabase/admin.ts`, used by cron routes.
- **Cron routes check** `x-cron-secret === process.env.CRON_SECRET`, or return 401.
- **Time:** always compute in `Asia/Karachi`. The *logical day* runs 03:00 → 03:00, so a late check-in still counts for that day.
- **Pure core:** `streak.ts`, `schedule.ts` and `time.ts` are pure functions with Vitest tests covering every rule in spec §5 and §6.
- **Data, not code:** routine data (habits, blocks, meetings, offsets, targets) is seeded into the database and editable. Never hard-code it in components.
- **Design tokens:** colors come from CSS variables defined in `app/globals.css` per `docs/03_DESIGN.md`. No raw hex in components.
- **Checkpoint taps are instant:** optimistic update, a spring micro-animation and `navigator.vibrate?.(10)`.
- **Mobile-first at 390px.** Tap targets ≥ 44px. Safe-area insets respected. Dark theme is the default.
- **Idempotency:** notification rows carry a `dedupe_key`, so re-running a cron job never double-sends.

## Never
- No secrets in client code. Only the Supabase URL, the anon key and the VAPID public key may be `NEXT_PUBLIC_`.
- No more than 8 non-prayer notifications a day. Prayer reminders are never dropped.
- No points, XP or badges attached to Deen items. They count toward the streak only.
- No features from a later phase. No social features, leaderboards, ads or third-party analytics.
- No `any`. No class components. No UI libraries beyond shadcn/ui + Radix.

## Environment
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:zainulabideenbawa@gmail.com
CRON_SECRET=
APP_URL=https://<project>.vercel.app
ANTHROPIC_API_KEY=            # Phase 2
```

## Commands
```bash
pnpm dev --experimental-https   # local; HTTPS needed to test push
pnpm test                       # vitest
pnpm lint && pnpm typecheck
supabase db push                # apply migrations
supabase gen types typescript --linked > lib/database.types.ts
```

## Definition of done (every milestone)
- `pnpm typecheck`, `pnpm lint` and `pnpm test` pass.
- It works at 390px in dark theme.
- There's no console error.
- `docs/DECISIONS.md` is updated with any assumptions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

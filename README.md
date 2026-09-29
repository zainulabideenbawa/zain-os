# Zain OS — Founder Accountability Operating System (Phase 1)

**Zain OS** is a single-user accountability Progressive Web App (PWA) built specifically for Zain, a Muslim founder in Karachi (`Asia/Karachi`). It is structured around the five daily prayer checkpoints, one forgiving streak engine, a daily 07:30 "Big Rock" deep-work block, an evening Muhasaba reflection + plan flow, and an 84-day (12-week) founder cycle.

---

## 1. System Philosophy & Architecture

- **Salah is the Schedule:** Habits are anchored around the 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with Karachi prayer times computed dynamically via the `adhan` library and customized masjid jamaat offsets.
- **The Forgiving Streak Engine (`lib/streak.ts`):**
  - Chain counts consecutive kept days.
  - A missed day automatically redeems a banked freeze (`state = 'frozen'`).
  - Users earn +1 freeze per 7 kept days (banked maximum: 2).
  - Without a freeze, a single miss transitions to `at_risk`—the chain is preserved if kept the next day (`comeback`). Two consecutive misses reset the chain to 0 without shaming copy.
  - Saturday exception: `arabic_class` satisfies both Big Rock and Arabic.
  - Sunday exception: `weekly_review` satisfies Big Rock.
- **The 03:00 PKT Logical Day Boundary:**
  - Days run from 03:00 PKT to 03:00 PKT. Late-night check-ins still count toward that day.
  - Day close occurs automatically at 03:00 PKT via pg_cron.
- **Bad Day Mode:**
  - A single toggle switch that strips away non-essential target habits, focusing exclusively on the 5 prayer anchors and 1-line Muhasaba.
- **The Cookie Jar:**
  - Every evening Muhasaba records *"What went well?"*, building an immutable log of execution wins displayed on the Streaks tab to overcome resistance.
- **Decoupled Deen:**
  - Deen habits have `deen_no_points = true`. They count toward streak eligibility only, never gamified with points, XP, or badges.

---

## 2. Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript Strict · pnpm
- **Styling & UI:** Tailwind CSS v4 · shadcn/ui (Radix primitives) · Motion (`motion/react`) · lucide-react
- **Typography:**
  - Display: Cormorant Garamond (`--font-cormorant`)
  - Body: System UI font stack (`--font-sans`)
  - Numbers/Times: JetBrains Mono (`--font-mono`)
  - Arabic: Amiri (`--font-amiri`)
- **Database & Backend:**
  - Supabase Postgres with strict owner-isolated Row-Level Security (`auth.uid() = user_id`) on all 12 tables.
  - `@supabase/ssr` with Cookie-based auth.
  - Service-role client restricted to `lib/supabase/admin.ts` for cron handlers.
- **Scheduling & Push:**
  - `web-push` (VAPID) Web Push notifications.
  - `pg_cron` + `pg_net` with Supabase Vault secrets for zero-maintenance background dispatch.
- **Offline Reliability:**
  - IndexedDB queue via `idb-keyval` for offline habit check-in buffering and synchronization.
  - Serwist PWA service worker with offline precaching.

---

## 3. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Web Push (VAPID) Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=B...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:zainulabideenbawa@gmail.com

# Cron Job Authorization Secret
CRON_SECRET=your_high_entropy_secret_here

# App URL (Production Vercel deployment URL)
APP_URL=https://<your-app>.vercel.app
```

---

## 4. Local Development & Testing

```bash
# Install dependencies
pnpm install

# Run development server with HTTPS (required for Web Push testing)
pnpm dev --experimental-https

# Run all unit test suites (pure streak engine, schedule, time, milestones)
pnpm test

# Run TypeScript typecheck
pnpm typecheck

# Run ESLint
pnpm lint

# Production build test
pnpm build
```

---

## 5. Database Setup & Supabase Migrations

All migrations reside in `supabase/migrations/`:
1. `20260929000001_initial_schema.sql`: 12 tables with owner-only RLS and foreign key constraints.
2. `20260929000002_seed_function.sql`: Idempotent `seed_user(uid)` function populating habits, blocks, meetings, and profiles on first login.
3. `20260929000003_pg_cron_jobs.sql`: pg_cron jobs for dispatch, daily build, and day close.

To apply migrations to your remote Supabase instance:
```bash
# Push migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > lib/database.types.ts
```

### Supabase Vault Configuration for pg_cron
In the Supabase SQL Editor, store your deployment secrets in Vault:
```sql
select vault.create_secret('https://<your-app>.vercel.app', 'app_url');
select vault.create_secret('<your-cron-secret>', 'cron_secret');
```

---

## 6. Cron Jobs & Scheduling Architecture

- **`zainos-dispatch` (`* * * * *` - Every minute):**
  - Calls `POST /api/cron/dispatch`.
  - Re-evaluates conditions at send time (suppresses non-prayer alerts during active focus sessions, skips Big Rock nudge in Bad Day Mode, skips Muhasaba notification if already completed).
  - Sends due rows from `notification_queue` via `web-push`.
  - Automatically prunes dead subscriptions (HTTP 404/410).
- **`zainos-build` (`5 19 * * *` - 00:05 PKT / 19:05 UTC):**
  - Calls `POST /api/cron/daily?job=build`.
  - Generates today's complete notification plan with deterministic `dedupe_key` identifiers (`notif:{user_id}:{kind}:{date}:{time}`) preventing duplicate dispatches.
  - Enforces the &le; 8 non-prayer notifications per day cap.
- **`zainos-close` (`0 22 * * *` - 03:00 PKT / 22:00 UTC):**
  - Calls `POST /api/cron/daily?job=close`.
  - Evaluates yesterday's minimums via `evaluateStreak`.
  - Updates `days.state`, `profiles.streak`, `profiles.best_streak`, and banked `freezes`.

---

## 7. Progressive Web App (PWA) Installation

- **iOS (Safari):**
  1. Open the deployed application URL in Safari.
  2. Tap the **Share** button at the bottom of the screen.
  3. Scroll down and tap **Add to Home Screen**.
  4. Launch Zain OS directly from your home screen for standalone mode and Push Notification support.
- **Android (Chrome):**
  1. Open the URL in Chrome.
  2. Tap the three-dot menu and select **Install App** / **Add to Home screen**.

---

## 8. Milestone Completion Map

- **M0:** Project scaffolding (Next.js 16, Tailwind v4, fonts, 390px shell).
- **M1:** Supabase schema (12 tables, owner-only RLS, seed function, pg_cron).
- **M2:** Pure Core Engines (`time.ts`, `prayer.ts`, `streak.ts`, `schedule.ts`, `library.ts`).
- **M3:** Auth, Magic Link, 3-step onboarding, and bottom tab bar.
- **M4:** Today Screen Core (5 Salah checkpoints, Big Rock countdown, Bad Day Mode, Park Idea, offline sync).
- **M5:** Evening Muhasaba & Day Close (3-step sheet, Cookie Jar write, tomorrow's plan, Day Kept overlay).
- **M6:** Scheduler & Day Close (`/api/cron/dispatch`, `/api/cron/daily`, send-time verification).
- **M7:** Streaks (12-week heatmap, scorecard canvas sharing), Plan (WIG cycle, Maker blocks, settings, Sunday review, Apple Notes import), and Quick Capture (+).
- **M8:** Production readiness, audit, and documentation.

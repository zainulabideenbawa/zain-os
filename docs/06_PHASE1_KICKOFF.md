# Phase 1 Kickoff — Zain OS

## A. Prompt to paste into Antigravity (Planning mode)

> Read `AGENTS.md`, then the docs in the order it lists. We're building **Phase 1 only** of Zain OS.
>
> First, produce an implementation plan artifact that covers milestones M0–M8 below. Include the file list, database migrations and test cases. Wait for my approval before writing code.
>
> Then build **one milestone at a time**. After each milestone:
> 1. run `pnpm typecheck`, `pnpm lint` and `pnpm test`;
> 2. show me what changed and exactly how to test it on my phone or in the browser;
> 3. log any assumptions in `docs/DECISIONS.md`;
> 4. stop and wait for "next".
>
> Follow the stack and rules in `AGENTS.md` exactly. Don't add Phase 2+ features. If a doc is ambiguous, choose the simplest option that satisfies `01_PRODUCT_SPEC.md` and log it.

## B. Things Zain does by hand (the agent will ask for these)
1. **Supabase:** create a project (region close to Pakistan, e.g. Mumbai `ap-south-1`) → Database → Extensions: enable **pg_cron** and **pg_net** → Auth: enable Email (magic link) and add the site URL + redirect for the Vercel domain and `https://localhost:3000`.
2. **VAPID keys:** `npx web-push generate-vapid-keys` → put them in `.env.local` and in Vercel.
3. **Secrets:** create a long random `CRON_SECRET`. In Supabase → Vault, add `app_url` (the Vercel URL) and `cron_secret`.
4. **Vercel:** import the Git repo, add all env vars from `AGENTS.md`, and deploy. The Hobby plan is fine, because the per-minute clock is Supabase `pg_cron`.
5. **iPhone:** open the Vercel URL in Safari → Share → **Add to Home Screen** → open it from the icon → allow notifications.

## C. Milestones and acceptance criteria

**M0 — Scaffold**
- Next.js 16 + TS strict + pnpm
- Tailwind v4, with tokens from `03_DESIGN.md` in `globals.css` and `@theme inline`
- shadcn/ui initialised (button, drawer, dialog, switch, input, textarea, toast/sonner, progress, tabs)
- `next/font` set up for the four fonts
- ESLint, `typecheck` script, Vitest
- `.env.example`
- **Accept when:** the dev server shows a themed placeholder page in dark mode at 390px, and all scripts pass.

**M1 — Database**
- Migrations for every P1 table in spec §8, with enums, indexes on `(user_id, date)`, RLS owner policies on every table, and `updated_at` triggers
- A `seed_user(uid)` function that inserts everything in `04_SEED_DATA.md`
- Types generated into `lib/database.types.ts`
- **Accept when:** `supabase db push` succeeds, a fresh user can call `seed_user`, and another user can't read the rows.

**M2 — Pure core + tests** (`lib/time.ts`, `lib/prayer.ts`, `lib/streak.ts`, `lib/schedule.ts`)
- `time.ts`: the logical day (03:00 boundary), cycle week (1–12), phase week, and Karachi `now()`.
- `prayer.ts`: adhan with the Karachi method and Hanafi Asr, plus jamaat offsets/fixed times → `{azan, jamaat}` for each prayer on a given date. Sanity check for 2026-09-28: Fajr 05:07, Dhuhr 12:24, Asr 16:42, Maghrib 18:22, Isha 19:38 (±2 min).
- `streak.ts` tests must cover:
  - kept chain growth
  - a single miss → at_risk (chain kept)
  - a miss then kept → comeback (chain +1)
  - two misses → reset, with best kept
  - a freeze earned at 7 kept days and auto-used on a miss
  - the bank maximum of 2
  - Saturday arabic_class satisfying big_rock + arabic
  - Sunday weekly_review satisfying big_rock
  - milestones crossing 3/7/40/66
  - the week-win thresholds for weeks 1, 2 and 3+
- `schedule.ts` tests must cover:
  - 5 prayer rows at jamaat − 15
  - tahajjud_eve only on Sat/Tue/Thu
  - big_rock at 07:30 on Mon–Fri only
  - the nudge suppressed when a focus session is running or in Bad Day Mode
  - nothing after 21:45 except Tahajjud
  - no more than 8 non-prayer rows
  - unique dedupe keys
- **Accept when:** all tests pass.

**M3 — Auth, onboarding, PWA shell**
- Magic-link login; `seed_user` on first login
- The onboarding steps from `05_CONTENT.md` §8
- `app/manifest.ts` (name "Zain OS", short name "Zain OS", background and theme `#0F0F0F`, 192/512 icons with a gold flame on black)
- The Serwist service worker, handling precache, `push` (shows the notification) and `notificationclick` (opens `url`)
- Push subscription saved to `push_subscriptions`
- An iOS install guide when the app isn't running standalone
- **Accept when:** the app installs on iPhone and a test push from a dev-only button arrives.

**M4 — Today screen**
- Header (streak, freezes, week, Bad Day toggle)
- Why Card with Confirm and Victory Hour duas
- The 5 checkpoint chips + bottom sheet with minimums and targets (following the phase-in rules)
- Big Rock card: 5-4-3-2-1 → Bismillah → timer (Block / 60-10), energy tap on stop, and a `focus_sessions` write that auto-fills `big_rock` minutes
- Now/Next from routine blocks, including today's meetings
- Law of the day
- The "Day kept" overlay when the last minimum is done
- Optimistic updates, plus the IndexedDB offline queue that syncs on reconnect
- **Accept when:** a whole day can be ticked in under 60 seconds of taps, it works offline and syncs later, and the overlay fires exactly once.

**M5 — Muhasaba + Plan flow**
- The 3-step sheet per spec §4.5, with the copy from `05_CONTENT.md` §6
- Saving marks `muhasaba` done, writes `went_well` to the Cookie Jar and `plan` to tomorrow's row
- Tomorrow's Why Card and the 07:30 notification read that plan
- **Accept when:** the flow takes under 5 minutes and tomorrow's Big Rock card shows the first action.

**M6 — Scheduler and day close**
- `/api/cron/daily?job=build` writes today's `notification_queue` using `schedule.ts`
- `/api/cron/dispatch` sends due rows via `web-push`, re-checks conditions at send time, marks the status, and removes dead subscriptions (404/410)
- `/api/cron/daily?job=close` runs `streak.ts` for yesterday and updates `days.state` and profile streak/best/freezes
- A pg_cron migration with the three jobs from spec §6
- Both routes return 401 without `x-cron-secret`
- **Accept when:** on the deployed app a whole day of reminders arrives at the right Karachi times with no duplicates, and the 03:00 close updates the streak correctly.

**M7 — Streaks, Plan, Sunday review, extras**
- Streaks basic: number, best, next milestone, 12-week heatmap, week score ring, Cookie Jar, share scorecard PNG via `navigator.share` with a download fallback
- Plan basic: cycle card, this week, Maker Blocks hours vs 180 plus a next-step note, the parked list, and the personal project picker
- Settings: identity, niyyah, masjid times, habits min/target, blocks, Tahajjud nights, notification toggles, coach tone
- Sunday review lite
- Quick capture (+)
- Import past days: pick a date and tick its minimums (for the days already tracked in Notes)
- Coach placeholder + muhasaba history
- **Accept when:** every item in spec §9 P1 is reachable from the 4 tabs.

**M8 — Ship**
- Deploy to Vercel with the env vars set and the Vault secrets set
- A Lighthouse PWA check
- A final pass at 390px on iPhone in dark and light themes
- `README.md` with setup steps
- **Accept when:** Zain uses it for a full day: reminders arrive, the streak closes at 03:00, and nothing crashes.

## D. Out of scope for Phase 1
AI coach replies, outcomes scorecard, energy/khushu charts, library card, partner link, Telegram, stakes, Hard Mode, Ramadan mode, integrations.

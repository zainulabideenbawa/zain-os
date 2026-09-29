# Fix Round 1 — review of the live app
*Reviewed Sep 29, 2026 against https://zain-os-build.vercel.app, the repo, and the Supabase project `zain-os`.*

## Prompt to paste into Antigravity
> Read `docs/07_FIX_ROUND_1.md`. Fix the items in order (P0 first). For each item: make the change, add or adjust a test where it says **Test**, and run `pnpm typecheck && pnpm lint && pnpm test`. Log the decisions in `docs/DECISIONS.md`. Stop after P0 and show me how to verify it on my phone. Then do P1 and P2 the same way. Don't add features beyond this list.

---

## What's working
- It's deployed. Tabs, the dark/gold theme and the Arabic rendering all look right.
- Prayer times are correct to within a minute.
- All 12 tables have RLS with owner policies.
- The three pg_cron jobs are active. `/api/cron/dispatch` returns 200 every minute, and the cron secret check works.
- The streak engine (`lib/streak.ts`) follows the spec: at-risk, comeback, freezes, milestones and the Sat/Sun exceptions.

## P0 — Blockers (the app can't do its job until these are fixed)

**P0-1 · No login gate; "preview fallback" code**
- **Problem:** `/today`, `/plan` and `/streaks` render without a session. `app/(app)/today/page.tsx`, `app/actions/today.ts`, `app/actions/muhasaba.ts` and `app/actions/plan.ts` fall back to "look up seeded profile". With RLS on, this silently shows empty or fake data, and writes go nowhere. Supabase has **0 users**, so nothing has ever been saved.
- **Fix:**
  - Add `proxy.ts` (Next 16's middleware) using `@supabase/ssr`. Refresh the session, and redirect unauthenticated requests on `/(app)` routes to `/login`. Allow `/login`, `/auth/*`, `/api/cron/*`, `/manifest.webmanifest`, `/sw.js`, `/icons/*` and static files through.
  - Delete every seeded-profile fallback. Server actions throw a "Not signed in" error when there's no user.
- **Test:** Signed out, `/today` redirects to `/login`. Signed in, Today loads your own rows.

**P0-2 · Onboarding is skipped, so reminders never get enabled**
- **Problem:** The auth callback always redirects to `/today`. `/onboarding` is the only place that registers the service worker and subscribes to push, so push is never set up.
- **Fix:**
  - Add `profiles.onboarded_at timestamptz`. The callback redirects to `/onboarding` when it's null.
  - The final onboarding step sets it.
  - Register `/sw.js` from a small client component in the root layout on every load, not only in onboarding.
  - Add **Settings → Reminders**: show the permission/subscription status, an "Enable reminders" button and a "Send test notification" button.
- **Test:** A new user lands on onboarding. After allowing, a `push_subscriptions` row exists and the test push arrives on the iPhone Home Screen app.

**P0-3 · Onboarding content is wrong and steps are missing**
- **Problem:** The rules card says "Muhasaba · 22:30" and "at-risk … recovers until Isha tomorrow". Both are wrong: muhasaba is after Isha (≈20:40), and an at-risk day is saved by keeping the **next whole day**. The steps from `05_CONTENT.md` §8 are also missing: the masjid jamaat times, the identity line, and (new) the niyyah and personal project.
- **Fix:** The onboarding steps are:
  1. Welcome + corrected rules
  2. Install guide (iOS, if not standalone)
  3. Enable reminders
  4. Masjid jamaat times: show today's azan + jamaat for all 5 from `jamaat` offsets; editable as an offset or a fixed time; saved to `profiles.jamaat`
  5. Identity line + niyyah
  6. Personal project (pick from Parked, or type one) → `cycles.personal_project`
  7. "Day 1 starts now. Bismillah."

  Then build today's `notification_queue` immediately (see P0-4) so reminders start the same day.

**P0-4 · The nightly build creates yesterday's reminders, and they'd all fire at once**
- **Problem:** `zainos-build` runs at 00:05 PKT, but `getLogicalDate()` returns the **previous** day before 03:00. So it queues yesterday's schedule, and every send time is already in the past. `/api/cron/dispatch` would then push roughly 8 stale notifications just after midnight.
- **Fix:**
  - Move the build job to **03:05 PKT** (`5 22 * * *` UTC), right after `close`, so the logical date is correct and it can use the fresh streak and at-risk state.
  - Put the queue-building code in a shared function `buildQueueForUser(userId, logicalDate)`. Call it from the cron job, at the end of onboarding, and when jamaat times or Tahajjud days change (rebuild today's pending rows).
  - In dispatch, skip any row with `send_at < now() - 10 minutes` (status `skipped`, error `stale`).
- **Test:** Unit-test that at 00:05 and 03:05 PKT the build targets the correct logical date. Test that dispatch marks stale rows `skipped`.

**P0-5 · The Big Rock timer never saves anything**
- **Problem:** There's no insert into `focus_sessions` anywhere. So:
  - deep-work hours are always 0 (the Plan page shows a hard-coded **1.5h** when no data exists);
  - the Big Rock minimum isn't auto-filled;
  - the dispatcher's "focus running → only prayer reminders" rule never triggers;
  - there's no energy tap.

  The card also says "Block completed" just because it's past 09:30, even with no session.
- **Fix:**
  - Start inserts `focus_sessions` (`started_at`, `mode`, `project` = WIG, or `personal_project` in a Maker Block).
  - Stop/finish sets `ended_at` and `minutes`, then shows the **energy tap** (low / okay / high).
  - Upsert `day_logs` for `big_rock` (sum of today's WIG minutes; `done_min` at ≥ 90, `done_target` at the phase target) or `maker`.
  - The timer survives a reload: the running session is read back from the DB.
  - Card status comes from data: "Not started · 0/90", "In progress · 42 min", "Done · 95 min ✓".
- **Test:** Starting then stopping after ≥ 90 minutes (use a fake clock in the test) marks big_rock `done_min`.

## P1 — Correctness

**P1-1 · Streak display is faked**
- **Problem:** `profile.streak ?? 1` and `state: 'kept'` are hard-coded (Today + Streaks), so a new user sees "1 day, best 1".
- **Fix:** Default to 0. Derive the header state from yesterday's `days.state`: at_risk shows amber with the tooltip copy from `05_CONTENT.md` §4; frozen shows the blue ring.
- **Also:** Show today's progress toward a kept day (e.g. "4/6 minimums").

**P1-2 · Hard-coded Plan data**
- **Problem:** `PlanView.tsx` falls back to `'Agency OS Client Portal'`, and the maker hours default to `1.5`.
- **Fix:** Use `cycles.personal_project`. When it's 'TBD', show a "Pick your personal project" button. Default the hours to 0.

**P1-3 · `seed_user` is callable by anyone (Supabase security advisor)**
- **Fix:**
  - `revoke execute on function public.seed_user(uuid) from anon, authenticated;`
  - Call it from the auth callback with the **admin** client.
  - Add `set search_path = public` to `seed_user` and `update_updated_at_column`.
  - Optional: move `pg_net` out of `public`, or accept the warning.

**P1-4 · Today screen is missing parts of the spec (§4.1)**
- Mark the **next** checkpoint with a gold border/glow and a live countdown to jamaat.
- Each checkpoint row shows its minimum under the name (Fajr: "Qur'an 1 page · move 20"; Dhuhr: "Big Rock 90 min"; Asr: "Arabic 10 min"; Isha: "Muhasaba + plan"). A done state gets a gold fill.
- Add the **Now / Next** card from `routine_blocks` (with today's meetings) and the **Law of the day**.
- The Why Card shows last night's plan (top 3 + Big Rock first action) above the Confirm button.
- The Muhasaba card is **purple**, and the header has a pulsing **green** dot. Both break `03_DESIGN.md`: use gold tokens and remove the dot.

**P1-5 · Prayer minute rounding**
- **Problem:** The app shows Asr 16:41, Dhuhr 12:23, Maghrib 18:21 and Isha 19:37. `adhan`'s rounded values are 16:42, 12:24, 18:22 and 19:38, so the formatter is truncating seconds.
- **Fix:** Round to the nearest minute (`Rounding.Nearest`), or format from rounded times. Jamaat offsets apply after rounding.
- **Test:** Sep 28 sanity values from `06_PHASE1_KICKOFF.md`.

## P2 — Polish

- **P2-1 · iOS icons:**
  - Only SVG icons exist, so iOS will use a screenshot as the Home Screen icon.
  - Add PNG `apple-touch-icon` (180), PNG 192/512 (a maskable version too), and `icons` in metadata.
  - Match the tokens: bg `#0F0F0F`, gold `#C8A96E` (currently `#0B0E14` / `#F59E0B`). The manifest `background_color`/`theme_color` should also be `#0F0F0F`.
- **P2-2 · Service worker:**
  - Add offline caching of the app shell, so Today opens with no network.
  - Make sure the IndexedDB tap queue flushes on the `online` event and on app focus.
- **P2-3 · Decisions log mismatches to correct:**
  - "Saturday arabic_class 18:30" should be 09:00–11:00.
  - "Sunday weekly_review 20:30" should be 09:00.
  - Onboarding "3-step sequence" should follow the 7 steps above.

## Zain's checklist (manual, before re-testing)
1. **Supabase → Authentication → URL Configuration:**
   - Site URL `https://zain-os-build.vercel.app`
   - Redirect URLs `https://zain-os-build.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`
2. After P0 is deployed: on iPhone, Safari → the app → Share → **Add to Home Screen**, open it from the icon, sign in with the magic link, and complete onboarding.
3. Confirm the masjid times in onboarding, then send yourself a test notification from Settings.

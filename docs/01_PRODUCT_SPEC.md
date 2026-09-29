# Zain OS — Product Spec
*v5 · Sep 29, 2026 · single user · Asia/Karachi*

Tags: **[P1]** build now · **[P2]** after Phase 1 has been used daily for a week · **[P3]** / **[P4]** later. Anything untagged belongs to the phase of its section.

---

## 1. Product in one line
An installable web app that tells Zain **what to do now**, keeps a **forgiving daily streak** honest, and **reaches out** at the right moments (after each salah, at the Big Rock, after Isha). An AI coach reads his logs. It's an accountability engine, not a to-do list.

## 2. Core concepts (glossary)

| Term | Meaning |
|---|---|
| **Checkpoint** | One of 5 moments tied to a salah: `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`. Each has 0–2 habits attached. |
| **Minimum** | The small version of a habit. All minimums done = **day kept** (streak +1). |
| **Target** | The full version. Feeds the **weekly score**; never affects the streak. |
| **Big Rock** | The first deep-work block of the day (07:30, 90 min minimum) on the WIG. |
| **WIG** | Wildly Important Goal of the current 12-week **cycle**. |
| **Logical day** | 03:00 → 03:00 Asia/Karachi. All "today" logic uses this. |
| **Muhasaba** | Evening self-review after Isha + plan for tomorrow. It's a minimum. |
| **Bad Day Mode** | A per-day toggle: targets hidden, fewer nudges; the minimums still apply. |
| **Maker Block** | Weekly personal-project time (Fri 14:30–16:30, Sat 11:30–13:15). A target, never a minimum. |

## 3. Constraints
- PWA. iOS push works only after **Add to Home Screen** (iOS 16.4+). Show an install guide when the app isn't running standalone.
- There's no background execution, so **all reminders are sent from the server** (spec §6).
- **Vercel Hobby cron** is limited to once a day with ±59 min precision. The minute clock is **Supabase `pg_cron`**, which calls Vercel routes.
- Offline: the app shell is cached; checkpoint taps made offline are queued in IndexedDB and synced on reconnect.

## 4. Screens

Bottom tab bar: **Today · Streaks · Plan · Coach**. A floating **+** button opens quick capture.

### 4.1 Today [P1]
Top to bottom:
1. **Header**
   - 🔥 streak count (gold; **amber** when at risk)
   - ❄️ banked freezes
   - "Week N of 12"
   - Bad Day Mode toggle (moon icon)
2. **Why Card** — shown until the morning confirm is tapped, or until 11:00.
   - Identity line, niyyah, and cycle countdown ("Week 1 of 12 · 84 days to launch 5 apps").
   - Last night's plan (top 3 + Big Rock first action).
   - **Confirm** button (1 tap; writes `days.confirmed_at`).
   - Collapsible **Victory Hour** content: after-Fajr dua and the dua against laziness (Arabic + meaning, from `05_CONTENT.md`).
3. **Checkpoint row** — five chips (🌅 ☀️ 🌤 🌇 🌙).
   - The next checkpoint is highlighted with its jamaat time and a countdown.
   - Tapping a chip opens a bottom sheet:
     - salah ✓ (on time)
     - that checkpoint's minimum habit(s) as big toggles
     - targets, as secondary toggles/counters (hidden in week 1 and in Bad Day Mode)
   - Every tap: optimistic update + spring pop + vibrate.
   - When the last minimum of the day is done: a full-width **"Day kept"** moment (flame grows, "Alhamdulillah").
4. **Big Rock card**
   - Tomorrow's first action (from last night's plan)
   - **5-4-3-2-1 → Start** button, labelled "Bismillah" on the final beat
   - A focus timer with modes **Block** (default 2 h) or **60/10**
   - Timer states: running, paused, done
   - At stop: one **energy tap** (low / okay / high) and the session is saved to `focus_sessions`
   - Shows deep-work hours this week
5. **Now / Next** — the current routine block with time left, and the next 2 blocks (from `routine_blocks`, including today's meetings).
6. **Law of the day** — one of the 12 Laws, rotating daily (static content).
7. **Evening card** — appears after Isha jamaat. It opens the 3-step **Muhasaba + Plan** flow (§4.5).

### 4.2 Streaks [P1 basic · P2 full]
- **[P1]**
  - Big streak number, best streak, and the next milestone with a progress bar
  - A 12-week calendar heatmap with day states: kept / at-risk / comeback / frozen / missed / future
  - This week's score ring and win/loss per past week
  - Cookie Jar: a list of `went_well` lines, newest first
  - **Share scorecard** button: renders a PNG card (streak, weekly score, deep-work hours, four pillar ticks) and opens `navigator.share`, with a download fallback
- **[P2]**
  - Per-habit streaks
  - Energy heatmap (hour × weekday, from focus_sessions.energy)
  - Khushu by prayer
  - Weekly trend sparkline

### 4.3 Plan [P1 basic · P2 full]
- **[P1]**
  - **Cycle card:** WIG, why, dates, week N, apps-launched counter
  - **This week:** targets for the phase-in week, Tahajjud nights, meetings list
  - **Maker Blocks:** the personal project name, hours this week vs ≥ 3 h, and a "next step" note
  - **Parked list**
  - **Settings:**
    - identity line, niyyah, coach tone
    - masjid jamaat times (5 offsets or fixed times)
    - habits (edit min/target)
    - routine blocks
    - Tahajjud nights
    - notification on/off per kind
- **[P2]**
  - **Outcomes (monthly scorecard):** the outcomes listed in `04_SEED_DATA.md` §7, each with baseline, monthly values, Dec 20 target and a sparkline; auto vs manual source; the lead/lag quadrant advice (see 02_SYSTEM Part 13)
  - Prompts on Oct 4, Nov 1, Dec 6 and Dec 20

### 4.4 Coach [P1 placeholder · P2 full]
- **[P1]** A static page: "Coach arrives in Phase 2", plus the muhasaba history list.
- **[P2]**
  - Chat with Claude
  - A daily reply after each muhasaba
  - Weekly review draft (Sunday 09:00) → edit → save, which sets next week's targets
  - Tone: Gentle / Direct / Jocko
  - The coach may cite a Law or a library idea (from `playbook.html` data)

### 4.5 Muhasaba + Plan flow [P1] — a full-screen, 3-step sheet taking about 5 minutes

**1. Tick**
- Today's minimums and targets, pre-filled from taps. The user confirms or adjusts.

**2. Muhasaba**
- energy 1–5
- **khushu 1–3**
- *What went well?* (1 line → Cookie Jar)
- *What didn't, and why?* (1 line + barrier chip: forgot / procrastinated / tired / overcommitted / distracted)
- *What do I own about today?* (optional)
- shukr / istighfar line (optional)

**3. Plan tomorrow**
- *Focusing Question:* "What's the ONE thing tomorrow that makes everything else easier?"
- Top 3 (#1 prefilled as the WIG)
- **Big Rock first action** (required)
- One if-then ("If ___, then I will ___")
- A read-only view of tomorrow's meetings and whether it's a Tahajjud night

Saving sets the muhasaba minimum done and writes `days.plan` for tomorrow. The copy is calm and direct.

### 4.6 Other P1 pieces
- **Onboarding (first run):** magic-link login → install guide (iOS) → enable notifications (Web Push subscribe) → confirm masjid times → identity line → done.
- **Quick capture (+):** a one-line text input into `capture`, reviewed on Sunday.
- **Sunday review [P1 lite]:** a checklist screen with the week's three numbers, a **roles check** (family / parents & kin / community / team — 4 toggles), phone-rules check (2 toggles), "next week focus" line, and a partner share button. Saves to `weeks`. The AI draft is P2.

## 5. Streak engine — `lib/streak.ts` (pure, fully tested) [P1]

```
Input: ordered day records { date, minimumsDone: boolean, frozenUsed?: boolean, isFuture }
       + settings { freezeEvery: 7, freezeBankMax: 2 }

day.kept      = all minimum habits for that date done (incl. 5 salah on time + muhasaba)
                Saturday: 'arabic_class' satisfies both big_rock and arabic
                Sunday:   'weekly_review' satisfies big_rock
bad_day       = UI only; minimums unchanged
chain         = consecutive kept days (frozen days neither add nor break)
missed day    → if a freeze is banked: auto-use it (state 'frozen')
              → else if the previous day was kept/frozen/comeback: state 'at_risk' (chain shown amber, NOT reset)
              → else (second consecutive miss): 'missed' and chain resets to 0
kept after at_risk → state 'comeback', chain continues (+1)
freezes       = +1 per 7 kept days (counting kept + comeback), bank max 2
best_chain    = max chain ever
milestones    = 3, 7, 14, 21, 40, 66, 100, then every 50
week.score    = targets_hit / targets_planned for the phase-in week
week.win      = cycle week 1: kept_days >= 6 | week 2: score >= 0.70 | week 3+: score >= 0.85
shrink_hint   = more than 2 (at_risk + reset) events in the last 14 days → surface a hint naming the most-failed minimum
```

The day is **closed** at 03:00 by `/api/cron/daily?job=close`, which runs the engine and writes `days.state`, `profiles.streak`, `profiles.best_streak` and `profiles.freezes`.

## 6. Notifications — `lib/schedule.ts` (pure, fully tested) [P1]

`/api/cron/daily?job=build` (00:05 PKT) builds today's rows in `notification_queue`. `/api/cron/dispatch` (every minute) sends rows with `send_at <= now()` and `status='pending'`, then marks them sent. Conditional rows are **re-checked at send time**.

| Kind | Send at | Condition at send time | Copy (see 05_CONTENT) |
|---|---|---|---|
| `prayer` ×5 | jamaat − 15 min | always (never suppressed) | "Asr jamaat in 15 · after: Arabic 10 min · 🔥 12" |
| `tahajjud_eve` | 21:30 the evening before a Tahajjud night | Tahajjud night set | "Tahajjud tonight — in bed now" |
| `big_rock` | 07:30 Mon–Fri | always (also in Bad Day Mode) | "Big Rock: {first action}. 5-4-3-2-1 → Start" |
| `big_rock_nudge` | 07:45 Mon–Fri | no running focus session AND not Bad Day Mode | "Big Rock hasn't started. Just 5 minutes?" |
| `muhasaba` | Isha jamaat + 25 min | muhasaba not done | "Muhasaba + plan — 5 min · 🔥 {n} on the line" |
| `streak_risk` | 21:45 | muhasaba or any minimum not done | "Streak at risk. 3 minutes saves it." |
| `comeback` | 07:10 | yesterday was at_risk | "Good. Comeback day — keep today and the streak is restored." |
| `weekly_review` | Sun 09:00 | review not saved | "Weekly review ready" |
| `monthly_check` [P2] | 1st Sunday 10:00 | — | "Monthly scorecard — 10 min" |

**Rules:**
- Maximum 8 non-prayer notifications a day.
- Only prayer notifications are sent while a focus session is running (the others are skipped with status `skipped`).
- Nothing is sent after 21:45 except `tahajjud_eve`.
- Every row has `dedupe_key = kind + logical_date`.
- Tapping a notification deep-links to the relevant sheet (`url`).
- **[P2]** If a kind is ignored (not opened) 5 days running, the coach asks whether to move it.

**pg_cron setup (migration) [P1]:**
```sql
-- requires extensions pg_cron and pg_net; store secrets in Supabase Vault
select cron.schedule('zainos-dispatch', '* * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/dispatch',
    headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))
  ); $$);
-- 00:05 PKT = 19:05 UTC ; 03:00 PKT = 22:00 UTC (pg_cron runs in UTC)
select cron.schedule('zainos-build', '5 19 * * *', $$ select net.http_post(url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/daily?job=build', headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))); $$);
select cron.schedule('zainos-close', '0 22 * * *', $$ select net.http_post(url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/daily?job=close', headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))); $$);
```

## 7. AI coach [P2]
- **Inputs:** today's muhasaba, the last 14 days of `days` + `day_logs` + `focus_sessions`, the cycle, the phase week and the tone.
- **Daily reply (≤ 60 words, varied):**
  - one specific win
  - the barrier behind any miss
  - one concrete fix for tomorrow
  - occasionally a Cookie Jar callback, a Law, or an ayah/hadith from `05_CONTENT`
- **Weekly draft:**
  - the three numbers
  - patterns (e.g. "the Big Rock fails on days you slept after 23:00")
  - one experiment
  - a shrink/grow suggestion
  - whether the plan is stale
- **Escalation:** after 2 silent days, a direct push.
- **Guardrails:** never moralises about deen; muhasaba is Zain's own self-accounting; no medical advice.

## 8. Data model (Supabase Postgres) [P1 unless tagged]

Every table has `user_id uuid references auth.users default auth.uid()` + an RLS owner policy. Timestamps are `timestamptz`; dates are the logical day (`date`).

```
profiles            (user_id pk, display_name, tz default 'Asia/Karachi', lat, lng,
                     calc_method default 'Karachi', madhab default 'Hanafi',
                     jamaat jsonb   -- {fajr:"05:30"|{offset:23}, dhuhr:"13:15", asr:{offset:18}, maghrib:{offset:3}, isha:"20:15"}
                     identity_text, niyyah, coach_tone default 'direct',
                     tahajjud_days int[] default '{0,3,5}',  -- pre-dawn of Sun, Wed, Fri (0=Sun)
                     streak int default 0, best_streak int default 0, freezes int default 0,
                     notif_prefs jsonb, created_at)
cycles              (id, start_date, end_date, wig, why, personal_project, status)
habits              (id, key unique, name, checkpoint enum(fajr,dhuhr,asr,maghrib,isha,anytime),
                     pillar enum(deen,body,build,business,growth,social),
                     kind enum(bool,count,minutes), min_value numeric null, target_value numeric null,
                     is_minimum bool, target_from_week int, days int[] default '{0,1,2,3,4,5,6}',
                     sort int, active bool, deen_no_points bool)
day_logs            (date, habit_id, value numeric, done_min bool, done_target bool, updated_at, pk(user_id,date,habit_id))
days                (date pk(user_id,date), state enum(kept,at_risk,comeback,frozen,missed,open),
                     bad_day bool, confirmed_at, energy int, khushu int,
                     went_well text, went_wrong text, barrier text, owned text, shukr text,
                     plan jsonb   -- {focusing_q, top3:[...], big_rock_first_action, if_then} written for date+1
                     closed_at)
focus_sessions      (id, date, block_key, project, mode enum(block,sixty_ten), started_at, ended_at, minutes, energy enum(low,okay,high))
routine_blocks      (id, key, label, kind enum(salah,deep,ops,meeting,maker,rest,personal),
                     start_time time null, end_time time null, anchor enum(fajr,dhuhr,asr,maghrib,isha) null,
                     anchor_offset_min int null, days int[], project text, sort)
weeks               (week_start date, cycle_week int, score numeric, win bool, kept_days int,
                     roles jsonb, phone_rules jsonb, next_focus text, review jsonb, shared_at)
capture             (id, text, created_at, cleared bool)
parked              (id, project, note, revisit_on)
push_subscriptions  (id, endpoint unique, p256dh, auth, device_label, created_at)
notification_queue  (id, logical_date, kind, send_at, title, body, url, status enum(pending,sent,skipped,failed),
                     sent_at, opened_at, dedupe_key unique, error)
outcomes [P2]       (id, cycle_id, area, name, unit, source enum(auto,manual), baseline, target, direction enum(up,down))
outcome_values [P2] (outcome_id, month_of date, value, note)
coach_messages [P2] (id, role, content, kind enum(daily,weekly,chat,escalation), created_at)
```

**Derived, not stored:** milestones, weekly deep-work hours, per-habit streaks (views or computed in `lib/`).

## 9. Build phases

| Phase | Scope |
|---|---|
| **P1 — Core loop** | Auth + onboarding · install guide · Today (Why Card, checkpoints, Big Rock timer + energy tap, Now/Next, Law of the day, Bad Day Mode) · Muhasaba + Plan flow · streak engine + day close · prayer times with masjid times · notifications (§6) · Streaks basic · Plan basic + settings · Sunday review lite · share scorecard · quick capture · offline tap queue · "import past days" (manual entry of days already done in Notes) |
| **P2 — Coach + insight** | Claude daily reply + weekly draft + chat · outcomes scorecard · energy heatmap · khushu view · per-habit streaks · library card · monthly check · ignored-reminder logic · escalation |
| **P3 — Accountability** | Partner read-only weekly link · Telegram bot · sadaqah stake tracker · Hard Mode challenges (incl. Mon/Thu fast) · 30-day upgrade picker · fresh-start reset cards |
| **P4 — Auto-proof** | GitHub commits, store launches, Stripe revenue, Screen Time via Shortcuts · Ramadan mode |

## 10. Defaults (editable in Settings)

| Item | Default |
|---|---|
| Location | Karachi 24.8607, 67.0011 · Karachi method · Hanafi |
| WIG | "5 apps launched & earning" (PayClock first) |
| Personal project | "TBD" (the user sets it) |
| Coach tone | Direct |
| Cycle | 2026-09-28 → 2026-12-20 |
| Phase-in | derived from the cycle week |

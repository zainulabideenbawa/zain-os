# Zain OS — Seed Data
Seed all of this in `supabase/migrations/*_seed.sql`, via a function `seed_user(uid uuid)` that runs on the user's first login. Everything below is editable later in Settings.

Weekday numbers: **0 = Sun, 1 = Mon … 6 = Sat**. Times are Asia/Karachi.

## 1. Profile
```yaml
display_name: Zain
tz: Asia/Karachi
lat: 24.8607
lng: 67.0011
calc_method: Karachi        # adhan CalculationMethod.Karachi()
madhab: Hanafi
jamaat:                     # confirmed by the user in onboarding
  fajr:    { offset: 23 }   # azan + 23 min (≈05:30 in late Sep)
  dhuhr:   { fixed: "13:15" }
  asr:     { offset: 18 }   # ≈17:00
  maghrib: { offset: 3 }
  isha:    { offset: 37 }   # ≈20:15
identity_text: "I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day."
niyyah: ""                  # user writes it in onboarding
coach_tone: direct
tahajjud_days: [0, 3, 5]    # pre-dawn of Sun, Wed, Fri → 'tahajjud_eve' reminders on Sat, Tue, Thu at 21:30
notif_prefs: { prayer: true, tahajjud_eve: true, big_rock: true, big_rock_nudge: true, muhasaba: true, streak_risk: true, comeback: true, weekly_review: true }
```

## 2. Cycle
```yaml
start_date: 2026-09-28
end_date:   2026-12-20
wig: "5 apps launched & earning"
why: ""                      # user fills it in
personal_project: "TBD"      # gets the Maker Blocks
status: active
```

## 3. Habits
`min` = the minimum that keeps the streak (only when `is_minimum: true`). `target` = the value counted in the weekly score from `target_from_week` onwards.

| key | name | checkpoint | pillar | kind | is_minimum | min | target | target_from_week | days | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| salah_fajr | Fajr on time | fajr | deen | count | ✅ | 1 | 2 | 3 | all | value: 0 missed · 1 on time · 2 jamaat |
| salah_dhuhr | Dhuhr on time | dhuhr | deen | count | ✅ | 1 | — | — | all | Jumu'ah on Fri |
| salah_asr | Asr on time | asr | deen | count | ✅ | 1 | — | — | all | |
| salah_maghrib | Maghrib on time | maghrib | deen | count | ✅ | 1 | — | — | all | |
| salah_isha | Isha on time | isha | deen | count | ✅ | 1 | 2 | 3 | all | |
| quran | Qur'an (pages) | fajr | deen | count | ✅ | 1 | 4 | 3 | all | ≈15 min |
| move | Move (minutes) | fajr | body | minutes | ✅ | 20 | 30 | 3 | all | run Mon/Wed/Fri · gym Tue/Thu/Sat · walk Sun |
| big_rock | Big Rock deep work (minutes) | dhuhr | build | minutes | ✅ | 90 | 180 (wk 2) → 240 (wk 3+) | 2 | 1–5 | auto-filled from focus_sessions where project = WIG; Sat satisfied by arabic_class; Sun by weekly_review |
| arabic | Arabic (minutes) | asr | deen | minutes | ✅ | 10 | 20 | 3 | all | Sat satisfied by arabic_class |
| muhasaba | Muhasaba + plan | isha | deen | bool | ✅ | 1 | — | — | all | set by saving the evening flow |
| arabic_class | Arabic class 9–11 | fajr | deen | bool | — | — | 1 | 1 | 6 | satisfies big_rock + arabic on Sat |
| weekly_review | Weekly review | dhuhr | build | bool | — | — | 1 | 1 | 0 | satisfies big_rock on Sun |
| adhkar_morning | Morning adhkar | fajr | deen | bool | — | — | 1 | 3 | all | deen_no_points |
| adhkar_evening | Evening adhkar | maghrib | deen | bool | — | — | 1 | 3 | all | deen_no_points |
| tahajjud | Tahajjud | fajr | deen | bool | — | — | 1 | 3 | 0,3,5 | weekly: target 3, min 1 (shown on Plan, not in the streak) |
| revenue_actions | Revenue actions | dhuhr | business | count | — | — | 3 | 3 | 1–5 | call / proposal / 5 follow-ups = 1 each |
| linkedin_post | LinkedIn post | dhuhr | business | bool | — | — | 1 | 3 | 1–5 | |
| family_dinner | Family dinner, phone away | maghrib | social | bool | — | — | 1 | 3 | all | |
| read | Read (minutes) | isha | growth | minutes | — | — | 20 | 3 | all | physical book, after muhasaba |
| bed_2145 | In bed by 21:45 | isha | body | bool | — | — | 1 | 3 | all | 21:30 on Tahajjud eves |
| clean_eating | Clean day (⅓ rule) | anytime | body | bool | — | — | 1 | 3 | all | |
| sadaqah | Daily sadaqah | anytime | deen | bool | — | — | 1 | 3 | all | deen_no_points |
| maker | Maker Block (minutes) | anytime | growth | minutes | — | — | 180/week | 1 | 5,6 | weekly target ≥ 180; from focus_sessions where project = personal_project |

All `deen` habits have `deen_no_points = true`: they never earn points or badges, only streak eligibility.

## 4. Routine blocks (shown in Now/Next and used for reminders)
Rows with an `anchor` are timed from that day's jamaat. The others have fixed times.

**Mon–Thu (1–4)**
| key | label | kind | time |
|---|---|---|---|
| tahajjud | Tahajjud | salah | 04:45–05:05 (Wed only among Mon–Thu) |
| fajr | Fajr (jamaat) | salah | anchor fajr, 20 min |
| victory | Qur'an + adhkar | personal | fajr +20 → +40 |
| move | Run (Mon/Wed) · Gym (Tue/Thu) | personal | 06:10–07:15 |
| breakfast | Breakfast · Why Card | rest | 07:15–07:30 |
| dw1 | Big Rock · Deep Work 1 | deep | 07:30–09:30 · project = WIG |
| standup | LinkedIn post + sales standup | meeting | 09:30–10:00 |
| dw2 | Deep Work 2 | deep | 10:00–11:30 · project = WIG |
| ops | TekScrum ops + meetings | ops | 11:30–13:15 |
| dhuhr | Dhuhr (jamaat) → lunch | salah | anchor dhuhr, 45 min |
| qailulah | Qailulah | rest | 14:00–14:20 |
| dw3 | Deep Work 3 | deep | 14:30–15:30 · project = TekScrum |
| admin | Admin + email + buffer | ops | 15:30–asr |
| asr | Asr → Arabic | salah | anchor asr, 30 min |
| family | Family / walk | rest | asr +30 → maghrib |
| maghrib | Maghrib → dinner | salah | anchor maghrib, 60 min |
| isha | Isha → muhasaba → read | salah | anchor isha, → 21:45 |
| sleep | Sleep | rest | 21:45 (21:30 on Tahajjud eves) |

**Fri (5):** Tahajjud 04:45 · Fajr · Qur'an + adhkar · run 06:10 · Big Rock 07:30–09:30 · standup 09:30 · Deep Work 2 10:00–11:30 · Jumu'ah prep + Surah al-Kahf 11:30 · Jumu'ah (anchor dhuhr) · lunch · **Maker Block 14:30–16:30** (SolSniper check first if needed, then the personal project) · Asr → Arabic · evening off · Isha → muhasaba → read.

**Sat (6):** Fajr · gym 05:45–07:00 · Arabic prep 08:00 · **Arabic class 09:00–11:00** · break · **Maker Block 11:30–13:15** · Dhuhr · afternoon off (family) · Asr → Arabic (optional; class counts) · Isha → muhasaba → read.

**Sun (0):** Tahajjud 04:45 · Fajr · slow morning · **Weekly review 09:00–09:30** · plan the week 09:30–10:00 · partner check-in (15 min) · rest, family, extra Qur'an · Asr → Arabic · Isha → muhasaba → read.

## 5. Meetings (routine_blocks with kind = meeting)

| key | label | days | time | active |
|---|---|---|---|---|
| standup | Sales standup + LinkedIn post | 1–5 | 09:30–10:00 | ✅ |
| sales_kickoff | Sales team kickoff | 1 | 11:30–12:15 | ✅ |
| pm_updates | PM / project updates (incl. Sindh Agri) | 2, 4 | 11:30–12:00 | ✅ |
| seo_team | SEO team | 4 | 12:00–12:45 | ✅ |
| strategy_okr | TekScrum strategy + OKR + monthly scorecard | first Sunday | 10:00–11:30 | ✅ |
| salon_checkin | Salon partner check-in | first Tuesday | 12:15–12:45 | ❌ (user to confirm) |
| qa_textile | QA textile pipeline review | third Tuesday | 12:15–12:45 | ❌ (user to confirm) |

## 6. Parked list (visible, not active)
LoreOS · Tools site · Accounting product · Ihsan · Niche sites (funeral homes etc.) · TekScrum parallel site. The user picks one as `personal_project`.

## 7. Outcomes [P2] (seed with baseline/target null; set on Oct 4)

| area | name | unit | source | direction |
|---|---|---|---|---|
| build | Apps live | count | manual | up |
| build | App revenue (month) | PKR/USD | manual | up |
| business | TekScrum revenue (month) | PKR/USD | manual | up |
| business | Deals closed (month) | count | manual | up |
| body | 5k time | min:sec | manual | down |
| body | Weight or waist | kg/cm | manual | user picks |
| deen | Qur'an pages (month) | pages | auto | up (target 120) |
| deen | Tahajjud nights (month) | count | auto | up (target 10) |
| deen | Salah on time % | % | auto | up (target 100) |
| arabic | Qur'anic words known | count | manual | up (target +300) |
| growth | Books finished (cycle) | count | auto (tap) | up (target 3) |
| social | Roles-check weeks green | x/4 | auto | up (target ≥3) |

## 8. Check dates
- Weekly review: every Sunday 09:00
- Monthly check: first Sunday (Oct 4 = baseline, Nov 1, Dec 6)
- Cycle review: Sun Dec 20

-- Zain OS Seed User Function
-- Spec Section 8 & docs/04_SEED_DATA.md

create or replace function seed_user(p_uid uuid)
returns void as $$
begin
  -- Idempotency check: if user is already seeded, exit
  if exists (select 1 from profiles where user_id = p_uid) then
    return;
  end if;

  -- 1. Insert Profile
  insert into profiles (
    user_id,
    display_name,
    tz,
    lat,
    lng,
    calc_method,
    madhab,
    jamaat,
    identity_text,
    niyyah,
    coach_tone,
    tahajjud_days,
    streak,
    best_streak,
    freezes,
    notif_prefs
  ) values (
    p_uid,
    'Zain',
    'Asia/Karachi',
    24.8607,
    67.0011,
    'Karachi',
    'Hanafi',
    '{
      "fajr": {"offset": 23},
      "dhuhr": {"fixed": "13:15"},
      "asr": {"offset": 18},
      "maghrib": {"offset": 3},
      "isha": {"offset": 37}
    }'::jsonb,
    'I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day.',
    '',
    'direct',
    '{0,3,5}',
    0,
    0,
    0,
    '{
      "prayer": true,
      "tahajjud_eve": true,
      "big_rock": true,
      "big_rock_nudge": true,
      "muhasaba": true,
      "streak_risk": true,
      "comeback": true,
      "weekly_review": true
    }'::jsonb
  );

  -- 2. Insert Cycle 1
  insert into cycles (
    user_id,
    start_date,
    end_date,
    wig,
    why,
    personal_project,
    status
  ) values (
    p_uid,
    '2026-09-28',
    '2026-12-20',
    '5 apps launched & earning',
    '',
    'TBD',
    'active'
  );

  -- 3. Insert Habits
  insert into habits (user_id, key, name, checkpoint, pillar, kind, is_minimum, min_value, target_value, target_from_week, days, sort, deen_no_points) values
    (p_uid, 'salah_fajr', 'Fajr on time', 'fajr', 'deen', 'count', true, 1, 2, 3, '{0,1,2,3,4,5,6}', 1, true),
    (p_uid, 'salah_dhuhr', 'Dhuhr on time', 'dhuhr', 'deen', 'count', true, 1, null, null, '{0,1,2,3,4,5,6}', 2, true),
    (p_uid, 'salah_asr', 'Asr on time', 'asr', 'deen', 'count', true, 1, null, null, '{0,1,2,3,4,5,6}', 3, true),
    (p_uid, 'salah_maghrib', 'Maghrib on time', 'maghrib', 'deen', 'count', true, 1, null, null, '{0,1,2,3,4,5,6}', 4, true),
    (p_uid, 'salah_isha', 'Isha on time', 'isha', 'deen', 'count', true, 1, 2, 3, '{0,1,2,3,4,5,6}', 5, true),
    (p_uid, 'quran', 'Qur''an (pages)', 'fajr', 'deen', 'count', true, 1, 4, 3, '{0,1,2,3,4,5,6}', 6, true),
    (p_uid, 'move', 'Move (minutes)', 'fajr', 'body', 'minutes', true, 20, 30, 3, '{0,1,2,3,4,5,6}', 7, false),
    (p_uid, 'big_rock', 'Big Rock deep work (minutes)', 'dhuhr', 'build', 'minutes', true, 90, 180, 2, '{1,2,3,4,5}', 8, false),
    (p_uid, 'arabic', 'Arabic (minutes)', 'asr', 'deen', 'minutes', true, 10, 20, 3, '{0,1,2,3,4,5,6}', 9, true),
    (p_uid, 'muhasaba', 'Muhasaba + plan', 'isha', 'deen', 'bool', true, 1, null, null, '{0,1,2,3,4,5,6}', 10, true),
    (p_uid, 'arabic_class', 'Arabic class 9–11', 'fajr', 'deen', 'bool', false, null, 1, 1, '{6}', 11, true),
    (p_uid, 'weekly_review', 'Weekly review', 'dhuhr', 'build', 'bool', false, null, 1, 1, '{0}', 12, false),
    (p_uid, 'adhkar_morning', 'Morning adhkar', 'fajr', 'deen', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 13, true),
    (p_uid, 'adhkar_evening', 'Evening adhkar', 'maghrib', 'deen', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 14, true),
    (p_uid, 'tahajjud', 'Tahajjud', 'fajr', 'deen', 'bool', false, null, 1, 3, '{0,3,5}', 15, true),
    (p_uid, 'revenue_actions', 'Revenue actions', 'dhuhr', 'business', 'count', false, null, 3, 3, '{1,2,3,4,5}', 16, false),
    (p_uid, 'linkedin_post', 'LinkedIn post', 'dhuhr', 'business', 'bool', false, null, 1, 3, '{1,2,3,4,5}', 17, false),
    (p_uid, 'family_dinner', 'Family dinner, phone away', 'maghrib', 'social', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 18, false),
    (p_uid, 'read', 'Read (minutes)', 'isha', 'growth', 'minutes', false, null, 20, 3, '{0,1,2,3,4,5,6}', 19, false),
    (p_uid, 'bed_2145', 'In bed by 21:45', 'isha', 'body', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 20, false),
    (p_uid, 'clean_eating', 'Clean day (⅓ rule)', 'anytime', 'body', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 21, false),
    (p_uid, 'sadaqah', 'Daily sadaqah', 'anytime', 'deen', 'bool', false, null, 1, 3, '{0,1,2,3,4,5,6}', 22, true),
    (p_uid, 'maker', 'Maker Block (minutes)', 'anytime', 'growth', 'minutes', false, null, 180, 1, '{5,6}', 23, false);

  -- 4. Insert Routine Blocks
  insert into routine_blocks (user_id, key, label, kind, start_time, end_time, anchor, anchor_offset_min, days, project, sort, active) values
    (p_uid, 'tahajjud', 'Tahajjud', 'salah', '04:45:00', '05:05:00', null, null, '{0,3,5}', null, 1, true),
    (p_uid, 'fajr', 'Fajr (jamaat)', 'salah', null, null, 'fajr', 20, '{0,1,2,3,4,5,6}', null, 2, true),
    (p_uid, 'victory', 'Qur''an + adhkar', 'personal', null, null, 'fajr', 40, '{0,1,2,3,4,5,6}', null, 3, true),
    (p_uid, 'move', 'Run / Gym', 'personal', '06:10:00', '07:15:00', null, null, '{1,2,3,4,5,6}', null, 4, true),
    (p_uid, 'breakfast', 'Breakfast · Why Card', 'rest', '07:15:00', '07:30:00', null, null, '{1,2,3,4,5}', null, 5, true),
    (p_uid, 'dw1', 'Big Rock · Deep Work 1', 'deep', '07:30:00', '09:30:00', null, null, '{1,2,3,4,5}', 'WIG', 6, true),
    (p_uid, 'standup', 'LinkedIn post + sales standup', 'meeting', '09:30:00', '10:00:00', null, null, '{1,2,3,4,5}', 'TekScrum', 7, true),
    (p_uid, 'dw2', 'Deep Work 2', 'deep', '10:00:00', '11:30:00', null, null, '{1,2,3,4,5}', 'WIG', 8, true),
    (p_uid, 'ops', 'TekScrum ops + meetings', 'ops', '11:30:00', '13:15:00', null, null, '{1,2,3,4}', 'TekScrum', 9, true),
    (p_uid, 'dhuhr', 'Dhuhr (jamaat) → lunch', 'salah', null, null, 'dhuhr', 45, '{0,1,2,3,4,5,6}', null, 10, true),
    (p_uid, 'qailulah', 'Qailulah', 'rest', '14:00:00', '14:20:00', null, null, '{1,2,3,4,5}', null, 11, true),
    (p_uid, 'dw3', 'Deep Work 3', 'deep', '14:30:00', '15:30:00', null, null, '{1,2,3,4}', 'TekScrum', 12, true),
    (p_uid, 'admin', 'Admin + email + buffer', 'ops', '15:30:00', null, 'asr', 0, '{1,2,3,4}', 'TekScrum', 13, true),
    (p_uid, 'asr', 'Asr → Arabic', 'salah', null, null, 'asr', 30, '{0,1,2,3,4,5,6}', null, 14, true),
    (p_uid, 'family', 'Family / walk', 'rest', null, null, 'maghrib', 0, '{0,1,2,3,4,5,6}', null, 15, true),
    (p_uid, 'maghrib', 'Maghrib → dinner', 'salah', null, null, 'maghrib', 60, '{0,1,2,3,4,5,6}', null, 16, true),
    (p_uid, 'isha', 'Isha → muhasaba → read', 'salah', null, null, 'isha', 0, '{0,1,2,3,4,5,6}', null, 17, true),
    (p_uid, 'sleep', 'Sleep', 'rest', '21:45:00', null, null, null, '{0,1,2,3,4,5,6}', null, 18, true),
    -- Friday block
    (p_uid, 'maker_fri', 'Maker Block', 'maker', '14:30:00', '16:30:00', null, null, '{5}', 'personal_project', 19, true),
    -- Saturday blocks
    (p_uid, 'arabic_sat', 'Arabic class 9–11', 'deep', '09:00:00', '11:00:00', null, null, '{6}', null, 20, true),
    (p_uid, 'maker_sat', 'Maker Block', 'maker', '11:30:00', '13:15:00', null, null, '{6}', 'personal_project', 21, true),
    -- Sunday blocks
    (p_uid, 'review_sun', 'Weekly review', 'deep', '09:00:00', '09:30:00', null, null, '{0}', null, 22, true),
    (p_uid, 'plan_sun', 'Plan the week', 'ops', '09:30:00', '10:00:00', null, null, '{0}', null, 23, true),
    -- Meetings
    (p_uid, 'sales_kickoff', 'Sales team kickoff', 'meeting', '11:30:00', '12:15:00', null, null, '{1}', 'TekScrum', 24, true),
    (p_uid, 'pm_updates', 'PM / project updates', 'meeting', '11:30:00', '12:00:00', null, null, '{2,4}', 'TekScrum', 25, true),
    (p_uid, 'seo_team', 'SEO team', 'meeting', '12:00:00', '12:45:00', null, null, '{4}', 'TekScrum', 26, true),
    (p_uid, 'strategy_okr', 'TekScrum strategy + OKR', 'meeting', '10:00:00', '11:30:00', null, null, '{0}', 'TekScrum', 27, true),
    (p_uid, 'salon_checkin', 'Salon partner check-in', 'meeting', '12:15:00', '12:45:00', null, null, '{2}', 'TekScrum', 28, false),
    (p_uid, 'qa_textile', 'QA textile pipeline review', 'meeting', '12:15:00', '12:45:00', null, null, '{2}', 'TekScrum', 29, false);

  -- 5. Insert Parked List
  insert into parked (user_id, project, note) values
    (p_uid, 'LoreOS', 'Operating system for lore and stories'),
    (p_uid, 'Tools site', 'Collection of targeted web utilities'),
    (p_uid, 'Accounting product', 'Simple ledger & invoicing for freelancers'),
    (p_uid, 'Ihsan', 'Excellence in daily work and deen'),
    (p_uid, 'Niche sites', 'Targeted local business sites (funeral homes, etc.)'),
    (p_uid, 'TekScrum parallel site', 'Marketing experiment for secondary services');
end;
$$ language plpgsql security definer;

-- Grant execution to authenticated and service_role
grant execute on function seed_user(uuid) to authenticated, service_role;

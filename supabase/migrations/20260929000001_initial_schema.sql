-- Zain OS Phase 1 Initial Schema
-- Spec Section 8: Database Data Model

-- 1. Enums
create type checkpoint_enum as enum ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'anytime');
create type pillar_enum as enum ('deen', 'body', 'build', 'business', 'growth', 'social');
create type habit_kind_enum as enum ('bool', 'count', 'minutes');
create type day_state_enum as enum ('kept', 'at_risk', 'comeback', 'frozen', 'missed', 'open');
create type focus_mode_enum as enum ('block', 'sixty_ten');
create type energy_enum as enum ('low', 'okay', 'high');
create type block_kind_enum as enum ('salah', 'deep', 'ops', 'meeting', 'maker', 'rest', 'personal');
create type notif_status_enum as enum ('pending', 'sent', 'skipped', 'failed');

-- 2. Trigger function for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Tables

-- 3.1 Profiles
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  display_name text not null default 'Zain',
  tz text not null default 'Asia/Karachi',
  lat numeric not null default 24.8607,
  lng numeric not null default 67.0011,
  calc_method text not null default 'Karachi',
  madhab text not null default 'Hanafi',
  jamaat jsonb not null default '{
    "fajr": {"offset": 23},
    "dhuhr": {"fixed": "13:15"},
    "asr": {"offset": 18},
    "maghrib": {"offset": 3},
    "isha": {"offset": 37}
  }'::jsonb,
  identity_text text not null default 'I am a Muslim who keeps his promises to Allah and to himself, and a builder who ships every day.',
  niyyah text not null default '',
  coach_tone text not null default 'direct',
  tahajjud_days int[] not null default '{0,3,5}',
  streak int not null default 0,
  best_streak int not null default 0,
  freezes int not null default 0,
  notif_prefs jsonb not null default '{
    "prayer": true,
    "tahajjud_eve": true,
    "big_rock": true,
    "big_rock_nudge": true,
    "muhasaba": true,
    "streak_risk": true,
    "comeback": true,
    "weekly_review": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_profiles_updated_at
before update on profiles
for each row execute function update_updated_at_column();

-- 3.2 Cycles
create table cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  start_date date not null,
  end_date date not null,
  wig text not null,
  why text default '',
  personal_project text default 'TBD',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index idx_cycles_user_status on cycles(user_id, status);

-- 3.3 Habits
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  key text not null,
  name text not null,
  checkpoint checkpoint_enum not null,
  pillar pillar_enum not null,
  kind habit_kind_enum not null,
  min_value numeric,
  target_value numeric,
  is_minimum bool not null default false,
  target_from_week int default 1,
  days int[] not null default '{0,1,2,3,4,5,6}',
  sort int not null default 0,
  active bool not null default true,
  deen_no_points bool not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_habits_user_key unique (user_id, key)
);

create index idx_habits_user_sort on habits(user_id, sort);

create trigger tr_habits_updated_at
before update on habits
for each row execute function update_updated_at_column();

-- 3.4 Day Logs
create table day_logs (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  habit_id uuid not null references habits(id) on delete cascade,
  value numeric not null default 0,
  done_min bool not null default false,
  done_target bool not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date, habit_id)
);

create index idx_day_logs_user_date on day_logs(user_id, date);

create trigger tr_day_logs_updated_at
before update on day_logs
for each row execute function update_updated_at_column();

-- 3.5 Days
create table days (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  state day_state_enum not null default 'open',
  bad_day bool not null default false,
  confirmed_at timestamptz,
  energy int,
  khushu int,
  went_well text,
  went_wrong text,
  barrier text,
  owned text,
  shukr text,
  plan jsonb,
  closed_at timestamptz,
  primary key (user_id, date)
);

create index idx_days_user_date on days(user_id, date);

-- 3.6 Focus Sessions
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date date not null,
  block_key text not null,
  project text not null,
  mode focus_mode_enum not null default 'block',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  minutes int not null default 0,
  energy energy_enum,
  created_at timestamptz not null default now()
);

create index idx_focus_sessions_user_date on focus_sessions(user_id, date);

-- 3.7 Routine Blocks
create table routine_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  key text not null,
  label text not null,
  kind block_kind_enum not null,
  start_time time,
  end_time time,
  anchor checkpoint_enum,
  anchor_offset_min int,
  days int[] not null default '{0,1,2,3,4,5,6}',
  project text,
  sort int not null default 0,
  active bool not null default true
);

create index idx_routine_blocks_user_active on routine_blocks(user_id, active, sort);

-- 3.8 Weeks
create table weeks (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  week_start date not null,
  cycle_week int not null,
  score numeric not null default 0,
  win bool not null default false,
  kept_days int not null default 0,
  roles jsonb,
  phone_rules jsonb,
  next_focus text,
  review jsonb,
  shared_at timestamptz,
  primary key (user_id, week_start)
);

create index idx_weeks_user_week on weeks(user_id, week_start);

-- 3.9 Capture
create table capture (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  text text not null,
  cleared bool not null default false,
  created_at timestamptz not null default now()
);

create index idx_capture_user_cleared on capture(user_id, cleared);

-- 3.10 Parked
create table parked (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project text not null,
  note text,
  revisit_on date,
  created_at timestamptz not null default now()
);

create index idx_parked_user on parked(user_id);

-- 3.11 Push Subscriptions
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  device_label text,
  created_at timestamptz not null default now()
);

create index idx_push_sub_user on push_subscriptions(user_id);

-- 3.12 Notification Queue
create table notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  logical_date date not null,
  kind text not null,
  send_at timestamptz not null,
  title text not null,
  body text not null,
  url text not null default '/today',
  status notif_status_enum not null default 'pending',
  sent_at timestamptz,
  opened_at timestamptz,
  dedupe_key text not null unique,
  error text
);

create index idx_notif_status_send on notification_queue(status, send_at);
create index idx_notif_user_date on notification_queue(user_id, logical_date);

-- 4. Enable Row Level Security (RLS) on all tables
alter table profiles enable row level security;
alter table cycles enable row level security;
alter table habits enable row level security;
alter table day_logs enable row level security;
alter table days enable row level security;
alter table focus_sessions enable row level security;
alter table routine_blocks enable row level security;
alter table weeks enable row level security;
alter table capture enable row level security;
alter table parked enable row level security;
alter table push_subscriptions enable row level security;
alter table notification_queue enable row level security;

-- 5. Owner-only RLS Policies
create policy "Owner can manage profiles" on profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage cycles" on cycles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage habits" on habits for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage day_logs" on day_logs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage days" on days for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage focus_sessions" on focus_sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage routine_blocks" on routine_blocks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage weeks" on weeks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage capture" on capture for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage parked" on parked for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage push_subscriptions" on push_subscriptions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner can manage notification_queue" on notification_queue for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

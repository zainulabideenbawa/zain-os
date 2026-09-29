-- Fix Round 1 Schema & Function Updates
-- 1. Add onboarded_at to profiles
alter table public.profiles add column if not exists onboarded_at timestamptz default null;

-- 2. Revoke execute on seed_user from anon, authenticated; grant to service_role only
revoke execute on function public.seed_user(uuid) from anon, authenticated;
grant execute on function public.seed_user(uuid) to service_role;

-- 3. Set search_path = public on functions
alter function public.seed_user(uuid) set search_path = public;
alter function public.update_updated_at_column() set search_path = public;

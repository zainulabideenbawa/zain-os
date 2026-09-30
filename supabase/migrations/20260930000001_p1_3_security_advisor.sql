-- P1-3: Security Advisor fixes for seed_user and search_path
-- Revoke execution from public roles
revoke all on function public.seed_user(uuid) from public;
revoke execute on function public.seed_user(uuid) from anon;
revoke execute on function public.seed_user(uuid) from authenticated;
grant execute on function public.seed_user(uuid) to service_role;

-- Set search_path = public on seed_user
alter function public.seed_user(uuid) set search_path = public;

-- Set search_path = public on update_updated_at_column if exists
do $$
begin
  if exists (select 1 from pg_proc where proname = 'update_updated_at_column') then
    alter function public.update_updated_at_column() set search_path = public;
  end if;
end $$;

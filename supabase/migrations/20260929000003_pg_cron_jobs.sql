-- Zain OS pg_cron Setup
-- Spec Section 6: Notifications & pg_cron schedule

-- Enable extensions if available
create extension if not exists pg_net;
create extension if not exists pg_cron;

do $$
begin
  -- Check if cron extension schema exists before scheduling
  if exists (select 1 from pg_namespace where nspname = 'cron') then

    -- 1. Unschedule old jobs if they exist to avoid duplicate key errors
    perform cron.unschedule('zainos-dispatch') where exists (select 1 from cron.job where jobname = 'zainos-dispatch');
    perform cron.unschedule('zainos-build') where exists (select 1 from cron.job where jobname = 'zainos-build');
    perform cron.unschedule('zainos-close') where exists (select 1 from cron.job where jobname = 'zainos-close');

    -- 2. Schedule zainos-dispatch (every minute)
    perform cron.schedule(
      'zainos-dispatch',
      '* * * * *',
      $cron$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/dispatch',
        headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))
      );
      $cron$
    );

    -- 3. Schedule zainos-build (00:05 PKT = 19:05 UTC)
    perform cron.schedule(
      'zainos-build',
      '5 19 * * *',
      $cron$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/daily?job=build',
        headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))
      );
      $cron$
    );

    -- 4. Schedule zainos-close (03:00 PKT = 22:00 UTC)
    perform cron.schedule(
      'zainos-close',
      '0 22 * * *',
      $cron$
      select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name='app_url') || '/api/cron/daily?job=close',
        headers := jsonb_build_object('x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name='cron_secret'))
      );
      $cron$
    );

  end if;
exception
  when others then
    -- Log warning if extensions or vault are not yet configured in local test
    raise notice 'pg_cron jobs could not be scheduled automatically. Ensure pg_cron, pg_net, and vault are enabled.';
end;
$$;

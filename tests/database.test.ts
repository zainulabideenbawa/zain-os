import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import type { Database, CheckpointEnum, PillarEnum } from '@/lib/database.types';

describe('M1 Database Schema & Seed Verification', () => {
  const schemaPath = path.resolve(
    import.meta.dirname,
    '../supabase/migrations/20260929000001_initial_schema.sql'
  );
  const seedPath = path.resolve(
    import.meta.dirname,
    '../supabase/migrations/20260929000002_seed_function.sql'
  );
  const cronPath = path.resolve(
    import.meta.dirname,
    '../supabase/migrations/20260929000003_pg_cron_jobs.sql'
  );

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  const cronSql = fs.readFileSync(cronPath, 'utf8');

  it('contains all 12 required tables in initial schema', () => {
    const tables = [
      'profiles',
      'cycles',
      'habits',
      'day_logs',
      'days',
      'focus_sessions',
      'routine_blocks',
      'weeks',
      'capture',
      'parked',
      'push_subscriptions',
      'notification_queue',
    ];

    tables.forEach((table) => {
      expect(schemaSql).toContain(`create table ${table}`);
      expect(schemaSql).toContain(`alter table ${table} enable row level security;`);
      expect(schemaSql).toContain(`create policy "Owner can manage ${table}" on ${table}`);
    });
  });

  it('enforces owner-only RLS policy condition (auth.uid() = user_id) on all tables', () => {
    const tables = [
      'profiles',
      'cycles',
      'habits',
      'day_logs',
      'days',
      'focus_sessions',
      'routine_blocks',
      'weeks',
      'capture',
      'parked',
      'push_subscriptions',
      'notification_queue',
    ];

    tables.forEach((table) => {
      expect(schemaSql).toContain(
        `create policy "Owner can manage ${table}" on ${table} for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);`
      );
    });
  });

  it('defines updated_at triggers for mutable tables', () => {
    expect(schemaSql).toContain('tr_profiles_updated_at');
    expect(schemaSql).toContain('tr_habits_updated_at');
    expect(schemaSql).toContain('tr_day_logs_updated_at');
  });

  it('seed_user function seeds all 23 habits from 04_SEED_DATA.md', () => {
    const requiredHabits = [
      'salah_fajr',
      'salah_dhuhr',
      'salah_asr',
      'salah_maghrib',
      'salah_isha',
      'quran',
      'move',
      'big_rock',
      'arabic',
      'muhasaba',
      'arabic_class',
      'weekly_review',
      'adhkar_morning',
      'adhkar_evening',
      'tahajjud',
      'revenue_actions',
      'linkedin_post',
      'family_dinner',
      'read',
      'bed_2145',
      'clean_eating',
      'sadaqah',
      'maker',
    ];

    expect(requiredHabits.length).toBe(23);
    requiredHabits.forEach((habitKey) => {
      expect(seedSql).toContain(`'${habitKey}'`);
    });
  });

  it('seed_user function seeds routine blocks including Friday, Saturday, Sunday, and TekScrum meetings', () => {
    const expectedBlocks = [
      'dw1',
      'standup',
      'dw2',
      'ops',
      'dhuhr',
      'qailulah',
      'dw3',
      'maker_fri',
      'arabic_sat',
      'maker_sat',
      'review_sun',
      'sales_kickoff',
      'pm_updates',
      'seo_team',
      'strategy_okr',
    ];

    expectedBlocks.forEach((blockKey) => {
      expect(seedSql).toContain(`'${blockKey}'`);
    });
  });

  it('seed_user function seeds parked project ideas', () => {
    expect(seedSql).toContain("'LoreOS'");
    expect(seedSql).toContain("'Tools site'");
    expect(seedSql).toContain("'Accounting product'");
    expect(seedSql).toContain("'Ihsan'");
  });

  it('pg_cron migration configures the 3 cron jobs', () => {
    expect(cronSql).toContain("'zainos-dispatch'");
    expect(cronSql).toContain("'zainos-build'");
    expect(cronSql).toContain("'zainos-close'");
  });

  it('verifies Database TypeScript types match table shapes', () => {
    type ProfileRow = Database['public']['Tables']['profiles']['Row'];
    type HabitRow = Database['public']['Tables']['habits']['Row'];

    const sampleProfile: ProfileRow = {
      user_id: 'test-user-id',
      display_name: 'Zain',
      tz: 'Asia/Karachi',
      lat: 24.8607,
      lng: 67.0011,
      calc_method: 'Karachi',
      madhab: 'Hanafi',
      jamaat: { fajr: { offset: 23 } },
      identity_text: 'I am a Muslim who keeps his promises',
      niyyah: '',
      coach_tone: 'direct',
      tahajjud_days: [0, 3, 5],
      streak: 0,
      best_streak: 0,
      freezes: 0,
      notif_prefs: { prayer: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sampleHabit: HabitRow = {
      id: 'habit-1',
      user_id: 'test-user-id',
      key: 'salah_fajr',
      name: 'Fajr on time',
      checkpoint: 'fajr',
      pillar: 'deen',
      kind: 'count',
      min_value: 1,
      target_value: 2,
      is_minimum: true,
      target_from_week: 3,
      days: [0, 1, 2, 3, 4, 5, 6],
      sort: 1,
      active: true,
      deen_no_points: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(sampleProfile.display_name).toBe('Zain');
    expect(sampleHabit.key).toBe('salah_fajr');

    const sampleCp: CheckpointEnum = 'fajr';
    const samplePillar: PillarEnum = 'deen';
    expect(sampleCp).toBe('fajr');
    expect(samplePillar).toBe('deen');
  });
});

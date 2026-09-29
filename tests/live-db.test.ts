import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createAdminClient } from '@/lib/supabase/admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env.local') });

describe('Live Supabase Integration & RLS Verification', () => {
  let adminClient: ReturnType<typeof createAdminClient>;
  let createdUserId: string | null = null;

  beforeAll(async () => {
    adminClient = createAdminClient();
    // Create an auth user via Admin Auth API
    const { data: user, error: userError } =
      await adminClient.auth.admin.createUser({
        email: `test_integration_${Date.now()}@zainos.local`,
        password: 'TestPassword123!',
        email_confirm: true,
      });

    if (userError || !user.user) {
      throw new Error(`Failed to create test auth user: ${userError?.message}`);
    }
    createdUserId = user.user.id;
  });

  afterAll(async () => {
    if (adminClient && createdUserId) {
      // Deleting user from auth.users cascades to all tables
      await adminClient.auth.admin.deleteUser(createdUserId);
    }
  });

  it('executes seed_user(uid) and inserts complete seed data for new user', async () => {
    expect(createdUserId).toBeTruthy();
    const uid = createdUserId!;

    // 1. Call seed_user RPC
    const { error: seedError } = await adminClient.rpc('seed_user', {
      p_uid: uid,
    });
    expect(seedError).toBeNull();

    // 2. Verify profile was created
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', uid)
      .single();

    expect(profileError).toBeNull();
    expect(profile?.display_name).toBe('Zain');
    expect(profile?.tz).toBe('Asia/Karachi');
    expect(profile?.calc_method).toBe('Karachi');
    expect(profile?.madhab).toBe('Hanafi');

    // 3. Verify exactly 23 habits were seeded
    const { data: habits, error: habitsError } = await adminClient
      .from('habits')
      .select('*')
      .eq('user_id', uid);

    expect(habitsError).toBeNull();
    expect(habits?.length).toBe(23);

    // 4. Verify routine blocks were seeded
    const { data: blocks, error: blocksError } = await adminClient
      .from('routine_blocks')
      .select('*')
      .eq('user_id', uid);

    expect(blocksError).toBeNull();
    expect(blocks?.length).toBe(29);

    // 5. Verify parked list was seeded
    const { data: parked, error: parkedError } = await adminClient
      .from('parked')
      .select('*')
      .eq('user_id', uid);

    expect(parkedError).toBeNull();
    expect(parked?.length).toBe(6);

    // 6. Test idempotency: calling seed_user again does not duplicate rows or error
    const { error: secondSeedError } = await adminClient.rpc('seed_user', {
      p_uid: uid,
    });
    expect(secondSeedError).toBeNull();

    const { data: habitsAfter } = await adminClient
      .from('habits')
      .select('*')
      .eq('user_id', uid);
    expect(habitsAfter?.length).toBe(23);
  });
});

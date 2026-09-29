'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getLogicalDate, getTomorrowDate } from '@/lib/time';

export interface MuhasabaPayload {
  date: string;
  energy: number; // 1-5
  khushu: number; // 1-3
  went_well: string;
  went_wrong: string;
  barrier: string; // forgot | procrastinated | tired | overcommitted | distracted
  owned?: string;
  shukr?: string;
  plan: {
    focusing_q: string;
    top3: string[]; // [wig, item2, item3]
    big_rock_first_action: string;
    if_then: string;
  };
}

async function getAuthenticatedUserOrFallback() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { supabase, userId: user.id };
  }

  // Fallback for local preview: look up seeded profile
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id')
    .limit(1);

  if (profiles && profiles.length > 0) {
    return { supabase, userId: profiles[0].user_id };
  }

  throw new Error('Unauthorized');
}

export async function saveMuhasabaAndPlan(payload: MuhasabaPayload) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();
    const logicalDate = payload.date || getLogicalDate();
    const tomorrowDate = getTomorrowDate(logicalDate);

    // 1. Update today's record in `days`
    const { error: dayError } = await supabase.from('days').upsert(
      {
        user_id: userId,
        date: logicalDate,
        energy: payload.energy,
        khushu: payload.khushu,
        went_well: payload.went_well,
        went_wrong: payload.went_wrong,
        barrier: payload.barrier,
        owned: payload.owned || null,
        shukr: payload.shukr || null,
        closed_at: new Date().toISOString(),
        state: 'open',
      },
      { onConflict: 'user_id,date' }
    );

    if (dayError) {
      console.error('[Action] saveMuhasabaAndPlan dayError:', dayError);
      return { success: false, error: dayError.message };
    }

    // 2. Locate the muhasaba habit and mark it done in `day_logs`
    const { data: muhasabaHabit } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('key', 'muhasaba')
      .maybeSingle();

    if (muhasabaHabit) {
      await supabase.from('day_logs').upsert(
        {
          user_id: userId,
          date: logicalDate,
          habit_id: muhasabaHabit.id,
          done_min: true,
          done_target: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date,habit_id' }
      );
    }

    // 3. Write tomorrow's plan into tomorrow's `days` row
    const { error: planError } = await supabase.from('days').upsert(
      {
        user_id: userId,
        date: tomorrowDate,
        plan: payload.plan,
        state: 'open',
      },
      { onConflict: 'user_id,date' }
    );

    if (planError) {
      console.error('[Action] saveMuhasabaAndPlan planError:', planError);
      return { success: false, error: planError.message };
    }

    // 4. Verify whether all minimum habits are completed for today
    const { data: minHabits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('active', true)
      .eq('is_minimum', true);

    const { data: logs } = await supabase
      .from('day_logs')
      .select('habit_id, done_min')
      .eq('user_id', userId)
      .eq('date', logicalDate);

    const logMap = new Map((logs || []).map((l) => [l.habit_id, l.done_min]));
    const allMinDone =
      Boolean(minHabits && minHabits.length > 0) &&
      (minHabits || []).every((h) => logMap.get(h.id) === true);

    // Fetch user current streak count
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak')
      .eq('user_id', userId)
      .maybeSingle();

    revalidatePath('/today');
    revalidatePath('/plan');
    revalidatePath('/streaks');

    return {
      success: true,
      allMinDone,
      streak: profile?.streak ?? 1,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

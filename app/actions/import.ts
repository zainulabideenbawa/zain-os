'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkDayMinimums, evaluateStreak, type DayInputRecord } from '@/lib/streak';
import { getTomorrowDate } from '@/lib/time';

async function getAuthenticatedUserOrFallback() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { supabase, userId: user.id };
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id')
    .limit(1);

  if (profiles && profiles.length > 0) {
    return { supabase, userId: profiles[0].user_id };
  }

  throw new Error('Unauthorized');
}

export async function importPastDay(params: {
  date: string;
  completedHabitIds: string[];
  wentWell?: string;
}) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();

    // 1. Fetch habits to map IDs to keys
    const { data: habits } = await supabase
      .from('habits')
      .select('id, key, is_minimum')
      .eq('user_id', userId);

    const habitMap = new Map((habits || []).map((h) => [h.id, h.key]));

    // 2. Insert day_logs for selected habits
    for (const hId of params.completedHabitIds) {
      await supabase.from('day_logs').upsert(
        {
          user_id: userId,
          date: params.date,
          habit_id: hId,
          done_min: true,
          done_target: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date,habit_id' }
      );
    }

    // 3. Evaluate if day minimums are fulfilled
    const completedKeys = params.completedHabitIds
      .map((id) => habitMap.get(id))
      .filter((k): k is string => Boolean(k));

    const isMinDone = checkDayMinimums(params.date, completedKeys);

    await supabase.from('days').upsert(
      {
        user_id: userId,
        date: params.date,
        state: isMinDone ? 'kept' : 'open',
        went_well: params.wentWell || null,
        closed_at: isMinDone ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,date' }
    );

    // 4. Recalculate streak from cycle start 2026-09-28
    const { data: allLogs } = await supabase
      .from('day_logs')
      .select('date, habit_id, done_min')
      .eq('user_id', userId)
      .gte('date', '2026-09-28');

    const dateToKeys = new Map<string, Set<string>>();
    for (const log of allLogs || []) {
      if (log.done_min) {
        const key = habitMap.get(log.habit_id);
        if (key) {
          if (!dateToKeys.has(log.date)) dateToKeys.set(log.date, new Set());
          dateToKeys.get(log.date)!.add(key);
        }
      }
    }

    const dayRecords: DayInputRecord[] = [];
    let curr = '2026-09-28';
    const nowStr = new Date().toISOString().split('T')[0];
    while (curr <= nowStr) {
      const keys = dateToKeys.get(curr) || new Set();
      dayRecords.push({
        date: curr,
        minimumsDone: checkDayMinimums(curr, keys),
      });
      curr = getTomorrowDate(curr);
    }

    const streakResult = evaluateStreak(dayRecords, { freezeEvery: 7, freezeBankMax: 2 });

    await supabase
      .from('profiles')
      .update({
        streak: streakResult.currentStreak,
        best_streak: streakResult.bestStreak,
        freezes: streakResult.freezesBanked,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    revalidatePath('/today');
    revalidatePath('/streaks');
    revalidatePath('/plan');

    return {
      success: true,
      dayKept: isMinDone,
      currentStreak: streakResult.currentStreak,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

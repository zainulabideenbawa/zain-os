'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getLogicalDate } from '@/lib/time';
import type { Database } from '@/lib/database.types';

type DayLogInsert = Database['public']['Tables']['day_logs']['Insert'];

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

export async function toggleHabitLog(params: {
  habitId: string;
  date: string;
  field: 'done_min' | 'done_target';
  value: boolean;
}) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();
    const logicalDate = params.date || getLogicalDate();

    // Fetch existing log if any
    const { data: existing } = await supabase
      .from('day_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', logicalDate)
      .eq('habit_id', params.habitId)
      .maybeSingle();

    const updatePayload: DayLogInsert = {
      user_id: userId,
      date: logicalDate,
      habit_id: params.habitId,
      done_min: existing?.done_min ?? false,
      done_target: existing?.done_target ?? false,
      updated_at: new Date().toISOString(),
      [params.field]: params.value,
    };

    // If target is marked done, minimum is automatically marked done as well
    if (params.field === 'done_target' && params.value) {
      updatePayload.done_min = true;
    }

    const { error } = await supabase
      .from('day_logs')
      .upsert(updatePayload, { onConflict: 'user_id,date,habit_id' });

    if (error) {
      console.error('[Action] toggleHabitLog error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/today');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function toggleBadDayMode(params: {
  date: string;
  badDay: boolean;
}) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();
    const logicalDate = params.date || getLogicalDate();

    const { error } = await supabase.from('days').upsert(
      {
        user_id: userId,
        date: logicalDate,
        bad_day: params.badDay,
        state: 'open',
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      console.error('[Action] toggleBadDayMode error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/today');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function parkIdea(params: {
  title: string;
  notes?: string;
}) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();

    const { error } = await supabase.from('parked').insert({
      user_id: userId,
      project: params.title,
      note: params.notes || null,
    });

    if (error) {
      console.error('[Action] parkIdea error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/today');
    revalidatePath('/plan');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function confirmMorningPlan(params: { date: string }) {
  try {
    const { supabase, userId } = await getAuthenticatedUserOrFallback();
    const logicalDate = params.date || getLogicalDate();

    const { error } = await supabase.from('days').upsert(
      {
        user_id: userId,
        date: logicalDate,
        confirmed_at: new Date().toISOString(),
        state: 'open',
      },
      { onConflict: 'user_id,date' }
    );

    if (error) {
      console.error('[Action] confirmMorningPlan error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/today');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

'use server';

import { requireUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';

export interface SundayReviewPayload {
  weekStart: string; // YYYY-MM-DD
  cycleWeek: number;
  score: number;
  win: boolean;
  keptDays: number;
  roles: {
    familyEvenings: boolean;
    parentsKin: boolean;
    actOfService: boolean;
    thankedTeam: boolean;
  };
  phoneRules: {
    outsideBedroom: boolean;
    socialWindows: boolean;
  };
  nextFocus: string;
}

export async function saveSundayReview(payload: SundayReviewPayload) {
  try {
    const { supabase, userId } = await requireUser();

    const { error } = await supabase.from('weeks').upsert(
      {
        user_id: userId,
        week_start: payload.weekStart,
        cycle_week: payload.cycleWeek,
        score: payload.score,
        win: payload.win,
        kept_days: payload.keptDays,
        roles: payload.roles as any,
        phone_rules: payload.phoneRules as any,
        next_focus: payload.nextFocus,
        shared_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,week_start' }
    );

    if (error) {
      console.error('[Action:saveSundayReview] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/plan');
    revalidatePath('/streaks');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

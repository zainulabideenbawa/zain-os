'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    const { supabase, userId } = await getAuthenticatedUserOrFallback();

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

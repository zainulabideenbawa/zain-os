'use server';

import { requireUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/database.types';

export async function updateProfileSettings(params: {
  displayName?: string;
  identityText?: string;
  niyyah?: string;
  coachTone?: string;
  jamaat?: Record<string, unknown>;
  tahajjudDays?: number[];
  notifPrefs?: Record<string, boolean>;
}) {
  try {
    const { supabase, userId } = await requireUser();

    const updatePayload: Partial<Database['public']['Tables']['profiles']['Update']> = {
      updated_at: new Date().toISOString(),
    };

    if (params.displayName !== undefined) updatePayload.display_name = params.displayName;
    if (params.identityText !== undefined) updatePayload.identity_text = params.identityText;
    if (params.niyyah !== undefined) updatePayload.niyyah = params.niyyah;
    if (params.coachTone !== undefined) updatePayload.coach_tone = params.coachTone;
    if (params.jamaat !== undefined) updatePayload.jamaat = params.jamaat as any;
    if (params.tahajjudDays !== undefined) updatePayload.tahajjud_days = params.tahajjudDays;
    if (params.notifPrefs !== undefined) updatePayload.notif_prefs = params.notifPrefs as any;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('user_id', userId);

    if (error) {
      console.error('[Action:updateProfileSettings] Error:', error);
      return { success: false, error: error.message };
    }

    if (params.jamaat !== undefined || params.tahajjudDays !== undefined) {
      try {
        const { getLogicalDate } = await import('@/lib/time');
        const { buildQueueForUser } = await import('@/lib/queue');
        await buildQueueForUser(userId, getLogicalDate());
      } catch (err) {
        console.warn('[Action:updateProfileSettings] Rebuild queue warning:', err);
      }
    }

    revalidatePath('/plan');
    revalidatePath('/today');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateHabitConfig(params: {
  habitId: string;
  minValue?: number | null;
  targetValue?: number | null;
  active?: boolean;
}) {
  try {
    const { supabase, userId } = await requireUser();

    const payload: Partial<Database['public']['Tables']['habits']['Update']> = {
      updated_at: new Date().toISOString(),
    };

    if (params.minValue !== undefined) payload.min_value = params.minValue;
    if (params.targetValue !== undefined) payload.target_value = params.targetValue;
    if (params.active !== undefined) payload.active = params.active;

    const { error } = await supabase
      .from('habits')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', params.habitId);

    if (error) {
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

export async function addParkedItem(params: {
  project: string;
  note?: string;
  revisitOn?: string;
}) {
  try {
    const { supabase, userId } = await requireUser();

    const { data, error } = await supabase
      .from('parked')
      .insert({
        user_id: userId,
        project: params.project,
        note: params.note || null,
        revisit_on: params.revisitOn || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/plan');
    return { success: true, item: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function deleteParkedItem(id: string) {
  try {
    const { supabase, userId } = await requireUser();

    const { error } = await supabase
      .from('parked')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/plan');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateCyclePersonalProject(personalProject: string) {
  try {
    const { supabase, userId } = await requireUser();

    const { error } = await supabase
      .from('cycles')
      .update({ personal_project: personalProject })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/plan');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

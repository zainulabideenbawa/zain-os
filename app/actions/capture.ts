'use server';

import { requireUser } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';

export async function saveQuickCapture(text: string) {
  try {
    if (!text || !text.trim()) {
      return { success: false, error: 'Text cannot be empty' };
    }

    const { supabase, userId } = await requireUser();

    const { data, error } = await supabase
      .from('capture')
      .insert({
        user_id: userId,
        text: text.trim(),
        cleared: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Action:saveQuickCapture] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/plan');
    revalidatePath('/today');
    return { success: true, item: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function clearCaptureItem(id: string) {
  try {
    const { supabase, userId } = await requireUser();

    const { error } = await supabase
      .from('capture')
      .update({ cleared: true })
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

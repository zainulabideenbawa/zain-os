'use server';

import { requireUser } from '@/lib/supabase/auth';
import { buildQueueForUser } from '@/lib/queue';
import { getLogicalDate } from '@/lib/time';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/database.types';

export async function getOnboardingInitialData() {
  const { supabase, userId } = await requireUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const { data: parked } = await supabase
    .from('parked')
    .select('id, project, note')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  const { data: cycle } = await supabase
    .from('cycles')
    .select('personal_project')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  return {
    profile,
    parked: parked || [],
    personalProject: cycle?.personal_project || '',
  };
}

export async function completeOnboarding(params: {
  jamaat?: Record<string, unknown>;
  identityText?: string;
  niyyah?: string;
  personalProject?: string;
}) {
  const { supabase, userId } = await requireUser();
  const logicalDate = getLogicalDate();

  // 1. Update profiles table
  const profileUpdates: Partial<Database['public']['Tables']['profiles']['Update']> = {
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (params.jamaat !== undefined) profileUpdates.jamaat = params.jamaat as any;
  if (params.identityText !== undefined) profileUpdates.identity_text = params.identityText;
  if (params.niyyah !== undefined) profileUpdates.niyyah = params.niyyah;

  const { error: profError } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('user_id', userId);

  if (profError) {
    throw new Error(profError.message);
  }

  // 2. Set personal_project on the active cycle
  if (params.personalProject) {
    await supabase
      .from('cycles')
      .update({
        personal_project: params.personalProject,
      })
      .eq('user_id', userId)
      .eq('status', 'active');
  }

  // 3. Immediately build today's notification queue
  try {
    await buildQueueForUser(userId, logicalDate);
  } catch (err) {
    console.warn('[Onboarding] Error building initial queue:', err);
  }

  revalidatePath('/today');
  revalidatePath('/plan');
  revalidatePath('/streaks');

  return { success: true };
}

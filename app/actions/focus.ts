'use server';

import { requireUser } from '@/lib/supabase/auth';
import { getLogicalDate } from '@/lib/time';
import { calculateSessionMinutes } from '@/lib/focus';
import { revalidatePath } from 'next/cache';

export async function startFocusSession(params?: {
  blockKey?: string;
  project?: string;
  mode?: 'block' | 'sixty_ten';
  date?: string;
}) {
  const { supabase, userId } = await requireUser();
  const logicalDate = params?.date || getLogicalDate();
  const blockKey = params?.blockKey || 'big_rock';
  const mode = params?.mode || 'block';

  // Check if a session is already active
  const { data: running } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (running) {
    return { success: true, session: running, alreadyRunning: true };
  }

  // Determine project
  let project = params?.project;
  if (!project) {
    if (blockKey === 'big_rock') {
      project = 'WIG';
    } else {
      const { data: cycle } = await supabase
        .from('cycles')
        .select('personal_project')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      project = cycle?.personal_project || 'Personal Project';
    }
  }

  const { data: session, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: userId,
      date: logicalDate,
      block_key: blockKey,
      project,
      mode,
      started_at: new Date().toISOString(),
      minutes: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/today');
  return { success: true, session };
}

export async function stopFocusSession(params?: {
  sessionId?: string;
  energy?: 'low' | 'okay' | 'high';
  endedAt?: string;
}) {
  const { supabase, userId } = await requireUser();
  const now = params?.endedAt ? new Date(params.endedAt) : new Date();

  // Find running session
  let sessionQuery = supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null);

  if (params?.sessionId) {
    sessionQuery = sessionQuery.eq('id', params.sessionId);
  }

  const { data: session, error: findError } = await sessionQuery
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError || !session) {
    return { success: false, error: 'No active focus session found to stop' };
  }

  const elapsedMins = Math.max(1, calculateSessionMinutes(session.started_at, now));

  // 1. Update session
  const { data: updatedSession, error: updateError } = await supabase
    .from('focus_sessions')
    .update({
      ended_at: now.toISOString(),
      minutes: elapsedMins,
      energy: params?.energy || null,
    })
    .eq('id', session.id)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  // 2. Sum all completed sessions for this block today
  const { data: allTodaySessions } = await supabase
    .from('focus_sessions')
    .select('minutes')
    .eq('user_id', userId)
    .eq('date', session.date)
    .eq('block_key', session.block_key)
    .not('ended_at', 'is', null);

  const totalMinutes = (allTodaySessions || []).reduce(
    (acc, s) => acc + (s.minutes || 0),
    0
  );

  // 3. Upsert day_logs for the corresponding habit
  const { data: habit } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('key', session.block_key)
    .maybeSingle();

  if (habit) {
    const minVal = habit.min_value ?? 90;
    const targetVal = habit.target_value ?? 180;
    const doneMin = totalMinutes >= minVal;
    const doneTarget = totalMinutes >= targetVal;

    await supabase.from('day_logs').upsert(
      {
        user_id: userId,
        date: session.date,
        habit_id: habit.id,
        value: totalMinutes,
        done_min: doneMin,
        done_target: doneTarget,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date,habit_id' }
    );
  }

  revalidatePath('/today');
  revalidatePath('/plan');

  return {
    success: true,
    session: updatedSession,
    totalMinutes,
    doneMin: totalMinutes >= 90,
  };
}

export async function setSessionEnergy(
  sessionId: string,
  energy: 'low' | 'okay' | 'high'
) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase
    .from('focus_sessions')
    .update({ energy })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/today');
  return { success: true };
}

export async function getFocusSessionState(date?: string) {
  const { supabase, userId } = await requireUser();
  const logicalDate = date || getLogicalDate();

  // Active session
  const { data: activeSession } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Completed sessions today
  const { data: todaySessions } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', logicalDate)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: true });

  const totalMinutes = (todaySessions || [])
    .filter((s) => s.block_key === 'big_rock')
    .reduce((acc, s) => acc + (s.minutes || 0), 0);

  return {
    activeSession,
    todaySessions: todaySessions || [],
    totalBigRockMinutes: totalMinutes,
  };
}

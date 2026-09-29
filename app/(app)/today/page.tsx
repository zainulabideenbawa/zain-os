import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLogicalDate, getCycleWeek } from '@/lib/time';
import { getDayPrayerTimes } from '@/lib/prayer';
import { TodayView, type StreakInfo } from '@/components/today/TodayView';
import type { Database } from '@/lib/database.types';

type Habit = Database['public']['Tables']['habits']['Row'];
type DayLog = Database['public']['Tables']['day_logs']['Row'];
type Day = Database['public']['Tables']['days']['Row'];
type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];

export const revalidate = 0; // dynamic server render

export default async function TodayPage() {
  const logicalDate = getLogicalDate();
  const cycleWeek = getCycleWeek(logicalDate);
  const prayerSchedule = getDayPrayerTimes(logicalDate);

  let initialDay: Day | null = null;
  let initialDayLogs: DayLog[] = [];
  let habits: Habit[] = [];
  let streak: StreakInfo | null = null;
  let initialActiveSession: FocusSession | null = null;
  let initialCompletedMinutes = 0;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const userId = user.id;

    // 1. Fetch or create today's day record
    const { data: dayData } = await supabase
      .from('days')
      .select('*')
      .eq('user_id', userId)
      .eq('date', logicalDate)
      .maybeSingle();

    initialDay = dayData;

    // 2. Fetch all habits for user
    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('sort', { ascending: true });

    habits = habitsData || [];

    // 3. Fetch day logs for today
    const { data: logsData } = await supabase
      .from('day_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', logicalDate);

    initialDayLogs = logsData || [];

    // 4. Fetch profile for streak & freezes
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, freezes')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      streak = {
        current: profile.streak ?? 0,
        state: 'kept',
        freezes_banked: profile.freezes ?? 0,
      };
    }

    // 5. Fetch active & today's focus sessions
    const { data: focusSessions } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', logicalDate);

    initialActiveSession =
      (focusSessions || []).find((s) => s.ended_at === null) || null;
    initialCompletedMinutes = (focusSessions || [])
      .filter((s) => s.block_key === 'big_rock' && s.ended_at !== null)
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
  } catch (err) {
    console.warn('[TodayPage] DB fetch error:', err);
  }

  return (
    <TodayView
      date={logicalDate}
      cycleWeek={cycleWeek}
      initialDay={initialDay}
      initialDayLogs={initialDayLogs}
      habits={habits}
      prayerSchedule={prayerSchedule}
      streak={streak}
      initialActiveSession={initialActiveSession}
      initialCompletedMinutes={initialCompletedMinutes}
    />
  );
}

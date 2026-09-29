import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLogicalDate, getCycleWeek, getYesterdayDate } from '@/lib/time';
import { StreaksView, type CookieJarItem } from '@/components/streaks/StreaksView';

export const revalidate = 0; // Dynamic SSR

export default async function StreaksPage() {
  const logicalDate = getLogicalDate();
  const cycleWeek = getCycleWeek(logicalDate);

  let streak = 0;
  let bestStreak = 0;
  let freezes = 0;
  let daysMap: Record<string, 'kept' | 'at_risk' | 'comeback' | 'frozen' | 'missed' | 'open' | 'future'> = {};
  let cookieJar: CookieJarItem[] = [];
  let weeklyScore = 85;
  let deepWorkHours = 4.5;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const userId = user.id;

    // 1. Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, best_streak, freezes')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      streak = profile.streak ?? 0;
      bestStreak = Math.max(profile.best_streak ?? 0, streak);
      freezes = profile.freezes ?? 0;
    }

      // 2. Fetch past days in cycle
      const { data: daysList } = await supabase
        .from('days')
        .select('date, state, went_well')
        .eq('user_id', userId)
        .gte('date', '2026-09-28')
        .lte('date', logicalDate)
        .order('date', { ascending: false });

      for (const d of daysList || []) {
        if (d.state) {
          daysMap[d.date] = d.state;
        }
        if (d.went_well && d.went_well.trim()) {
          cookieJar.push({
            date: d.date,
            went_well: d.went_well.trim(),
          });
        }
      }

      // Mark today as open if not yet evaluated
      if (!daysMap[logicalDate]) {
        daysMap[logicalDate] = 'open';
      }

      // 3. Fetch deep work hours this week from focus_sessions
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('minutes')
        .eq('user_id', userId)
        .gte('date', '2026-09-28');

      const totalMinutes = (sessions || []).reduce((acc, s) => acc + (s.minutes || 0), 0);
      if (totalMinutes > 0) {
        deepWorkHours = Math.round((totalMinutes / 60) * 10) / 10;
      }
    }
  } catch (err) {
    console.warn('[StreaksPage] DB fetch error:', err);
  }

  return (
    <StreaksView
      streak={streak}
      bestStreak={bestStreak}
      freezes={freezes}
      currentState={daysMap[logicalDate] || 'open'}
      daysMap={daysMap}
      cookieJar={cookieJar}
      weeklyScore={weeklyScore}
      deepWorkHours={deepWorkHours}
      cycleWeek={cycleWeek}
    />
  );
}

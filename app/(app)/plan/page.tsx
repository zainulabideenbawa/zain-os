import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLogicalDate, getCycleWeek, getCycleDaysRemaining, getNowKarachi } from '@/lib/time';
import { PlanView } from '@/components/plan/PlanView';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Cycle = Database['public']['Tables']['cycles']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];
type Parked = Database['public']['Tables']['parked']['Row'];

export const revalidate = 0; // Dynamic SSR

export default async function PlanPage() {
  const logicalDate = getLogicalDate();
  const cycleWeek = getCycleWeek(logicalDate);
  const daysRemaining = getCycleDaysRemaining(logicalDate);

  let profile: Profile | null = null;
  let cycle: Cycle | null = null;
  let habits: Habit[] = [];
  let parkedList: Parked[] = [];
  let makerHours = 0;
  let streak = 0;
  let weeklyScore = 85;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user.id;

  try {
    // 1. Fetch profile
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    profile = p;
    if (profile?.streak) streak = profile.streak;

      // 2. Fetch cycle
      const { data: c } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      cycle = c;

      // 3. Fetch habits
      const { data: h } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('sort', { ascending: true });

      habits = h || [];

      // 4. Fetch parked items
      const { data: pk } = await supabase
        .from('parked')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      parkedList = pk || [];

      // 5. Fetch maker blocks hours
      const { data: sessions } = await supabase
        .from('focus_sessions')
        .select('minutes')
        .eq('user_id', userId)
        .eq('block_key', 'maker');

      const totalMins = (sessions || []).reduce((acc, s) => acc + (s.minutes || 0), 0);
      if (totalMins > 0) {
        makerHours = Math.round((totalMins / 60) * 10) / 10;
      }
    }
  } catch (err) {
    console.warn('[PlanPage] DB fetch error:', err);
  }

  // Monday of current week for week_start
  const todayDate = new Date();
  const day = todayDate.getDay();
  const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(todayDate.setDate(diff)).toISOString().split('T')[0];

  return (
    <PlanView
      profile={profile}
      cycle={cycle}
      habits={habits}
      parkedList={parkedList}
      makerHours={makerHours}
      cycleWeek={cycleWeek}
      daysRemaining={daysRemaining}
      streak={streak}
      weeklyScore={weeklyScore}
      weekStart={monday}
    />
  );
}

import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { CoachView, type MuhasabaHistoryItem } from '@/components/coach/CoachView';

export const revalidate = 0; // Dynamic SSR

export default async function CoachPage() {
  let history: MuhasabaHistoryItem[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
      const { data: p } = await supabase.from('profiles').select('user_id').limit(1).maybeSingle();
      userId = p?.user_id;
    }

    if (userId) {
      const { data } = await supabase
        .from('days')
        .select('date, energy, khushu, went_well, went_wrong, barrier, owned, shukr, closed_at')
        .eq('user_id', userId)
        .not('went_well', 'is', null)
        .order('date', { ascending: false });

      history = (data || []).map((d) => ({
        date: d.date,
        energy: d.energy,
        khushu: d.khushu,
        went_well: d.went_well,
        went_wrong: d.went_wrong,
        barrier: d.barrier,
        owned: d.owned,
        shukr: d.shukr,
        closed_at: d.closed_at,
      }));
    }
  } catch (err) {
    console.warn('[CoachPage] DB fetch error:', err);
  }

  return <CoachView history={history} />;
}

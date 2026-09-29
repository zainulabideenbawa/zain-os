import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getLogicalDate, getYesterdayDate, getTomorrowDate, getKarachiParts } from '@/lib/time';
import { buildDailySchedule } from '@/lib/schedule';
import { buildQueueForUser } from '@/lib/queue';
import { evaluateStreak, checkDayMinimums, type DayInputRecord } from '@/lib/streak';
import type { JamaatSettings } from '@/lib/prayer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const job = searchParams.get('job');

    if (job !== 'build' && job !== 'close') {
      return NextResponse.json(
        { error: 'Invalid job parameter. Expected ?job=build or ?job=close' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // -------------------------------------------------------------
    // JOB: BUILD (03:05 PKT / 22:05 UTC)
    // -------------------------------------------------------------
    if (job === 'build') {
      const today = getLogicalDate();

      const { data: profiles, error: profError } = await admin
        .from('profiles')
        .select('user_id');

      if (profError) {
        return NextResponse.json({ error: profError.message }, { status: 500 });
      }

      let totalInserted = 0;
      for (const profile of profiles || []) {
        try {
          const count = await buildQueueForUser(profile.user_id, today);
          totalInserted += count;
        } catch (err) {
          console.error(`[Cron:Daily:Build] Error for user ${profile.user_id}:`, err);
        }
      }

      return NextResponse.json({
        success: true,
        job: 'build',
        logicalDate: today,
        notificationsInsertedOrUpdated: totalInserted,
      });
    }

    // -------------------------------------------------------------
    // JOB: CLOSE (03:00 PKT / 22:00 UTC)
    // -------------------------------------------------------------
    if (job === 'close') {
      const today = getLogicalDate();
      // At 03:00 PKT, the day that just concluded is yesterday
      const closedDate = getYesterdayDate(today);

      const { data: profiles, error: profError } = await admin
        .from('profiles')
        .select('*');

      if (profError) {
        return NextResponse.json({ error: profError.message }, { status: 500 });
      }

      let usersClosed = 0;

      for (const profile of profiles || []) {
        // 1. Fetch habits with keys for user
        const { data: habits } = await admin
          .from('habits')
          .select('id, key')
          .eq('user_id', profile.user_id);

        const habitMap = new Map<string, string>();
        for (const h of habits || []) {
          habitMap.set(h.id, h.key);
        }

        // 2. Fetch logs from start of cycle up to closedDate
        const { data: logs } = await admin
          .from('day_logs')
          .select('date, habit_id, done_min')
          .eq('user_id', profile.user_id)
          .gte('date', '2026-09-28')
          .lte('date', closedDate);

        // Group completed habit keys by date
        const dateLogs = new Map<string, Set<string>>();
        for (const log of logs || []) {
          if (log.done_min) {
            const key = habitMap.get(log.habit_id);
            if (key) {
              if (!dateLogs.has(log.date)) {
                dateLogs.set(log.date, new Set());
              }
              dateLogs.get(log.date)!.add(key);
            }
          }
        }

        // 3. Build day records array
        // Iterate through all days from 2026-09-28 to closedDate
        const dayRecords: DayInputRecord[] = [];
        let curr = '2026-09-28';
        while (curr <= closedDate) {
          const completedKeys = dateLogs.get(curr) || new Set();
          const minimumsDone = checkDayMinimums(curr, completedKeys);
          dayRecords.push({
            date: curr,
            minimumsDone,
          });
          curr = getTomorrowDate(curr);
        }

        // 4. Run pure streak engine
        const streakResult = evaluateStreak(dayRecords, {
          freezeEvery: 7,
          freezeBankMax: 2,
        });

        // 5. Update closed day row state
        const closedDayEval = streakResult.evaluatedDays.find(
          (d) => d.date === closedDate
        );

        await admin.from('days').upsert(
          {
            user_id: profile.user_id,
            date: closedDate,
            state: closedDayEval?.state || 'missed',
            closed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,date' }
        );

        // 6. Update user profile streak & best streak
        await admin
          .from('profiles')
          .update({
            streak: streakResult.currentStreak,
            best_streak: Math.max(
              streakResult.bestStreak,
              profile.best_streak ?? 0
            ),
            freezes: streakResult.freezesBanked,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.user_id);

        usersClosed++;
      }

      return NextResponse.json({
        success: true,
        job: 'close',
        closedDate,
        usersUpdated: usersClosed,
      });
    }

    return NextResponse.json({ error: 'Unsupported' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Daily] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

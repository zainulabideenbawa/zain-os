import { createAdminClient } from '@/lib/supabase/admin';
import { getYesterdayDate, getTomorrowDate, getKarachiParts } from '@/lib/time';
import { buildDailySchedule } from '@/lib/schedule';
import type { JamaatSettings } from '@/lib/prayer';

/**
 * Builds or rebuilds the daily notification queue for a user on a given logical date.
 * Deletes any existing pending notifications for that day before inserting newly computed rows.
 */
export async function buildQueueForUser(
  userId: string,
  logicalDate: string
): Promise<number> {
  const admin = createAdminClient();
  const yesterday = getYesterdayDate(logicalDate);
  const tomorrow = getTomorrowDate(logicalDate);

  // 1. Fetch user profile
  const { data: profile, error: profError } = await admin
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (profError || !profile) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  // 2. Fetch today's day record for planned first action
  const { data: todayDay } = await admin
    .from('days')
    .select('plan')
    .eq('user_id', userId)
    .eq('date', logicalDate)
    .maybeSingle();

  const planObj = todayDay?.plan as { big_rock_first_action?: string } | null;
  const bigRockFirstAction = planObj?.big_rock_first_action;

  // 3. Check if yesterday was at_risk
  const { data: yDay } = await admin
    .from('days')
    .select('state')
    .eq('user_id', userId)
    .eq('date', yesterday)
    .maybeSingle();

  const yesterdayWasAtRisk = yDay?.state === 'at_risk';

  // 4. Check if tomorrow morning is a Tahajjud day
  const tomorrowParts = getKarachiParts(`${tomorrow}T12:00:00Z`);
  const tahajjudDays = profile.tahajjud_days || [0, 3, 5];
  const isTahajjudNightNextMorning = tahajjudDays.includes(tomorrowParts.weekday);

  // 5. Generate planned schedule using pure scheduler
  const plannedNotifications = buildDailySchedule({
    logicalDate,
    streak: profile.streak ?? 0,
    bigRockFirstAction,
    isTahajjudNightNextMorning,
    yesterdayWasAtRisk,
    jamaatSettings: (profile.jamaat as Partial<JamaatSettings>) || {},
    notifPrefs: (profile.notif_prefs as Record<string, boolean>) || {},
  });

  // 6. Delete existing pending rows for this day so changes (e.g. jamaat or tahajjud) take effect cleanly
  await admin
    .from('notification_queue')
    .delete()
    .eq('user_id', userId)
    .eq('logical_date', logicalDate)
    .eq('status', 'pending');

  // 7. Upsert into notification_queue
  let inserted = 0;
  for (const notif of plannedNotifications) {
    const { error: insertError } = await admin
      .from('notification_queue')
      .upsert(
        {
          user_id: userId,
          logical_date: logicalDate,
          kind: notif.kind,
          send_at: notif.sendAt.toISOString(),
          title: notif.title,
          body: notif.body,
          url: notif.url,
          status: 'pending',
          dedupe_key: notif.dedupeKey,
        },
        { onConflict: 'dedupe_key' }
      );

    if (!insertError) inserted++;
  }

  return inserted;
}

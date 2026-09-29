import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { shouldSendAtDispatch } from '@/lib/schedule';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Fetch pending notifications due for sending
    const { data: queue, error: fetchError } = await admin
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('send_at', nowIso)
      .order('send_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('[Cron:Dispatch] Fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!queue || queue.length === 0) {
      return NextResponse.json({
        dispatched: 0,
        skipped: 0,
        failed: 0,
        message: 'No pending notifications due',
      });
    }

    let dispatchedCount = 0;
    let skippedCount = 0;
    const staleThresholdMs = Date.now() - 10 * 60 * 1000;

    for (const item of queue) {
      // 0. Skip stale rows (send_at < now() - 10 minutes) per P0-4
      const sendAtMs = new Date(item.send_at).getTime();
      if (sendAtMs < staleThresholdMs) {
        await admin
          .from('notification_queue')
          .update({
            status: 'skipped',
            error: 'stale',
          })
          .eq('id', item.id);
        skippedCount++;
        continue;
      }

      // 2. Evaluate send-time conditions
      // A. Active focus session check
      const { data: activeSessions } = await admin
        .from('focus_sessions')
        .select('id')
        .eq('user_id', item.user_id)
        .eq('date', item.logical_date)
        .is('ended_at', null)
        .limit(1);

      const isFocusSessionRunning = Boolean(
        activeSessions && activeSessions.length > 0
      );

      // B. Bad day mode check
      const { data: dayRecord } = await admin
        .from('days')
        .select('bad_day')
        .eq('user_id', item.user_id)
        .eq('date', item.logical_date)
        .maybeSingle();

      const isBadDayMode = Boolean(dayRecord?.bad_day);

      // C. Muhasaba habit check
      const { data: muhasabaHabit } = await admin
        .from('habits')
        .select('id')
        .eq('user_id', item.user_id)
        .eq('key', 'muhasaba')
        .maybeSingle();

      let isMuhasabaDone = false;
      if (muhasabaHabit) {
        const { data: log } = await admin
          .from('day_logs')
          .select('done_min')
          .eq('user_id', item.user_id)
          .eq('date', item.logical_date)
          .eq('habit_id', muhasabaHabit.id)
          .maybeSingle();
        isMuhasabaDone = Boolean(log?.done_min);
      }

      // D. Minimums completion check (for streak_risk)
      const { data: minHabits } = await admin
        .from('habits')
        .select('id')
        .eq('user_id', item.user_id)
        .eq('active', true)
        .eq('is_minimum', true);

      const { data: logs } = await admin
        .from('day_logs')
        .select('habit_id, done_min')
        .eq('user_id', item.user_id)
        .eq('date', item.logical_date);

      const logMap = new Map((logs || []).map((l) => [l.habit_id, l.done_min]));
      const isAnyMinimumNotDone = (minHabits || []).some(
        (h) => logMap.get(h.id) !== true
      );

      const conditionResult = shouldSendAtDispatch(item.kind, {
        isFocusSessionRunning,
        isBadDayMode,
        isMuhasabaDone,
        isAnyMinimumNotDone,
      });

      if (!conditionResult.shouldSend) {
        await admin
          .from('notification_queue')
          .update({
            status: 'skipped',
            error: conditionResult.skipReason || 'condition_not_met',
          })
          .eq('id', item.id);
        skippedCount++;
        continue;
      }

      // 3. Fetch push subscriptions for user
      const { data: subscriptions } = await admin
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', item.user_id);

      if (!subscriptions || subscriptions.length === 0) {
        await admin
          .from('notification_queue')
          .update({
            status: 'failed',
            error: 'no_push_subscription',
          })
          .eq('id', item.id);
        failedCount++;
        continue;
      }

      // 4. Send web-push to all user endpoints
      let sendSuccess = false;
      let lastErrorMessage = '';

      for (const sub of subscriptions) {
        const result = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          {
            title: item.title,
            body: item.body,
            url: item.url,
            dedupe_key: item.dedupe_key,
          }
        );

        if (result.success) {
          sendSuccess = true;
        } else {
          lastErrorMessage = result.error || 'Failed';
          // Clean up dead subscriptions (404 or 410)
          if (result.statusCode === 404 || result.statusCode === 410) {
            await admin
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
          }
        }
      }

      if (sendSuccess) {
        await admin
          .from('notification_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', item.id);
        dispatchedCount++;
      } else {
        await admin
          .from('notification_queue')
          .update({
            status: 'failed',
            error: lastErrorMessage,
          })
          .eq('id', item.id);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      dispatched: dispatchedCount,
      skipped: skippedCount,
      failed: failedCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Cron:Dispatch] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

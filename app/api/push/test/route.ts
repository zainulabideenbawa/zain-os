import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/push';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subs, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id);

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json(
        { error: 'No active push subscriptions found on this account. Please enable reminders first.' },
        { status: 404 }
      );
    }

    let successCount = 0;
    for (const sub of subs) {
      const res = await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        {
          title: 'Zain OS · Test Notification',
          body: 'Prayer and accountability reminders are connected. Bismillah.',
          url: '/today',
        }
      );
      if (res.success) {
        successCount++;
      }
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import webpush from 'web-push';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  dedupe_key?: string;
  priority?: 'normal' | 'urgent';
  url?: string;
  data?: Record<string, unknown>;
}

// Configure VAPID details if keys are present
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Server-side helper to send a web push notification
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const res = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return { success: true, statusCode: res.statusCode };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    console.error('[WebPush] Send error:', error?.message || err);
    return {
      success: false,
      statusCode: error?.statusCode,
      error: error?.message || 'Failed to send notification',
    };
  }
}

export { urlBase64ToUint8Array } from './push-client';


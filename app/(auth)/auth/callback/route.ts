import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/today';

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Ensure seed data exists idempotently
      try {
        await supabase.rpc('seed_user', { p_uid: user.id });
      } catch (seedErr) {
        console.warn('[Auth Callback] seed_user warning:', seedErr);
      }

      // Check if user is newly created or needs onboarding
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

      let redirectUrl = `${origin}${next}`;
      if (forwardedHost && !isLocalhost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

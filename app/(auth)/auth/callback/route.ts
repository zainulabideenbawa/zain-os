import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
      // Ensure seed data exists idempotently via admin client (P1-3)
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase.rpc('seed_user', { p_uid: user.id });

        // Check if user has completed onboarding (P0-2)
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('onboarded_at')
          .eq('user_id', user.id)
          .maybeSingle();

        const targetPath = profile?.onboarded_at ? next : '/onboarding';

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        let redirectUrl = `${origin}${targetPath}`;
        if (forwardedHost && !isLocalhost) {
          redirectUrl = `https://${forwardedHost}${targetPath}`;
        }

        return NextResponse.redirect(redirectUrl);
      } catch (seedErr) {
        console.warn('[Auth Callback] admin setup error:', seedErr);
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

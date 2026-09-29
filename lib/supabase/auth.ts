import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Not signed in');
  }

  return { supabase, userId: user.id, user };
}

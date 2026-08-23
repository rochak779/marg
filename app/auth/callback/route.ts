import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureServerEvent } from '@/lib/analytics/posthog-server';

// Handles the PKCE code exchange for email verification, password recovery
// and OAuth (Google) sign-in. See docs/SUPABASE_IMPLEMENTATION_PLAN.md
// section 8 "Application flow".
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`);
  }

  // Ensure a profile row exists on first login (email or Google).
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: data.user.id,
        first_name:
          (data.user.user_metadata?.first_name as string | undefined) ??
          (data.user.user_metadata?.full_name as string | undefined)?.split(
            ' ',
          )[0] ??
          data.user.email?.split('@')[0] ??
          'Learner',
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

  if (profileError) {
    console.error('profile upsert failed', { code: profileError.code });
  }

  // This route also handles password-reset and email-confirmation code
  // exchanges, both under the 'email' provider — only tag it as OAuth when
  // it actually is one, so those flows don't get mislabeled.
  if (data.user.app_metadata?.provider === 'google') {
    await captureServerEvent(data.user.id, 'oauth_sign_in_completed', {
      method: 'google',
    });
  }

  // Phase C will make this route to /assessment or /recommendation based on
  // server-side assessment/path state. For now every verified user lands
  // on /app, which itself enforces auth server-side.
  return NextResponse.redirect(`${origin}${next}`);
}

// Only relative, same-app paths are honored to prevent open redirects.
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/app';
  }
  return value;
}

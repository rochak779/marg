'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = credentialsSchema.extend({
  firstName: z.string().trim().min(1).max(100),
});

export async function signInWithPassword(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

export async function signUpWithPassword(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const { email, password, firstName } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

export async function requestPasswordReset(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = z.object({ email: z.string().trim().email() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      // Route through the callback so the recovery code is exchanged for a
      // session before landing on the password form, same as OAuth/verify.
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
    },
  );
  // Always report success to avoid leaking which emails have accounts.
  if (error) console.error('resetPasswordForEmail failed', { message: error.message });
  return { ok: true };
}

export async function updatePassword(
  input: unknown,
): Promise<AuthActionResult> {
  const parsed = z
    .object({ password: z.string().min(8) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });
  if (error || !data.url) {
    redirect('/signin?error=oauth_unavailable');
  }
  redirect(data.url);
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: mapAuthError(error.message) };
  return { ok: true };
}

// Keep raw provider error strings out of the UI.
function mapAuthError(message: string): string {
  const known: Record<string, string> = {
    'Invalid login credentials': 'invalid_credentials',
    'Email not confirmed': 'email_not_confirmed',
    'User already registered': 'already_registered',
    'email rate limit exceeded': 'rate_limited',
  };
  const mapped = known[message];
  if (!mapped) {
    // Unmapped provider errors collapse to a generic message in the UI —
    // log the raw message so we can diagnose what actually happened.
    console.error('Unmapped auth error', { message });
  }
  return mapped ?? 'unavailable';
}

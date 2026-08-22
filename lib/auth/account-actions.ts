'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type ExportResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

// Account export: everything this user owns, for the "download my data"
// flow. Deliberately excludes auth.users internals (password hash etc.) —
// only application-owned rows.
export async function exportAccountData(): Promise<ExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const [
    profile,
    assessments,
    paths,
    units,
    quizzes,
    builds,
    practices,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('assessment_results').select('*').eq('user_id', user.id),
    supabase
      .from('learning_paths')
      .select('*, learning_path_modules(module_id, position)')
      .eq('user_id', user.id),
    supabase.from('unit_progress').select('*').eq('user_id', user.id),
    supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
    supabase.from('build_progress').select('*').eq('user_id', user.id),
    supabase.from('practice_progress').select('*').eq('user_id', user.id),
  ]);

  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      account: { id: user.id, email: user.email, createdAt: user.created_at },
      profile: profile.data,
      assessments: assessments.data,
      learningPaths: paths.data,
      unitProgress: units.data,
      quizAttempts: quizzes.data,
      buildProgress: builds.data,
      practiceProgress: practices.data,
    },
  };
}

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

// Permanently deletes the caller's account and, via `on delete cascade`
// on every learner-owned table (section 5/6 of the plan), all their data.
// Requires the service-role key because deleting an auth.users row is an
// admin-only operation — a regular user session cannot do this to itself.
export async function deleteAccount(input: unknown): Promise<DeleteAccountResult> {
  if (input !== 'DELETE') {
    // Requires the literal confirmation string from the client, so this
    // can't be triggered by an accidental double-submit or a stray click.
    return { ok: false, error: 'confirmation_required' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('deleteUser failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  await supabase.auth.signOut();
  return { ok: true };
}

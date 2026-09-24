import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Service-role client. Bypasses RLS entirely — never import this from a
// client component, never return its results directly to the browser
// without checking they belong to the calling user first. Only used for
// operations regular users cannot perform on themselves via RLS, such as
// deleting their own auth.users row (supabase.auth.admin.*).
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createSupabaseClient<Database, 'marg'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      db: { schema: 'marg' },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}

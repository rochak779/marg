import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

// Server-side Supabase client for Server Components, Server Actions and
// Route Handlers. Reads/writes the session via the request's cookies.
//
// Server Components cannot set cookies, so a set() call from a Server
// Component context is a no-op there; the proxy (see proxy.ts) is what
// actually refreshes and persists the session cookie on every request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore, the proxy handles refresh.
          }
        },
      },
    },
  );
}

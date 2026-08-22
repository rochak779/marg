import { redirect } from 'next/navigation';
import { AppShell } from '@/components/learning/AppShell';
import { createClient } from '@/lib/supabase/server';

// Do not trust getSession() for authorization — getUser() re-validates the
// JWT against Auth servers. See SUPABASE_IMPLEMENTATION_PLAN.md section 8.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  return <AppShell>{children}</AppShell>;
}

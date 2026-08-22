import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SigninForm from './SigninForm';

export default async function SigninPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/app');
  }

  return <SigninForm />;
}

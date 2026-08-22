-- Phase D: local-state migration bookkeeping.
-- One row per user once their legacy localStorage state has been imported,
-- so a retried or duplicate import request is a safe no-op (see plan
-- section 9, step 7 "mark the import idempotency key as consumed").

create table public.local_state_imports (
  user_id uuid primary key references auth.users (id) on delete cascade,
  idempotency_key text not null,
  imported_at timestamptz not null default now()
);

alter table public.local_state_imports enable row level security;

create policy "local_state_imports_select_own" on public.local_state_imports
  for select using ((select auth.uid()) = user_id);

-- No client insert policy: writes go through the import server action using
-- the same trusted-function pattern as submit_assessment.

create or replace function public.record_local_state_import(p_idempotency_key text)
returns boolean -- true if this call recorded the import, false if already imported
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.local_state_imports (user_id, idempotency_key)
    values (v_user_id, p_idempotency_key)
    on conflict (user_id) do nothing;

  return found;
end;
$$;

revoke all on function public.record_local_state_import from public;
grant execute on function public.record_local_state_import to authenticated;

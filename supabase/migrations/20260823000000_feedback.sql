-- ---------------------------------------------------------------------------
-- feedback — in-app "Help & Feedback" submissions. Append-only, owner-only
-- RLS, matching the duel_results / quiz_attempts pattern: writes go only
-- through submit_feedback (security definer), never a direct insert policy.
-- ---------------------------------------------------------------------------

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  message text,
  created_at timestamptz not null default now()
);

create index feedback_user_id_idx on public.feedback (user_id);
create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

create policy "feedback_select_own" on public.feedback
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for the client: writes go only through
-- submit_feedback (security definer).

create or replace function public.submit_feedback(
  p_rating smallint,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  insert into public.feedback (user_id, rating, message)
    values (v_user_id, p_rating, nullif(trim(p_message), ''))
    returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.submit_feedback from public;
grant execute on function public.submit_feedback to authenticated;

-- ---------------------------------------------------------------------------
-- duel_results — bot-only Duels (Challenges). Append-only, owner-only RLS,
-- matching the quiz_attempts pattern. See
-- docs/superpowers/specs/2026-08-22-duels-challenges-design.md.
-- ---------------------------------------------------------------------------

create table public.duel_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id smallint not null,
  question_ids text[] not null,
  user_score smallint not null check (user_score between 0 and 100),
  user_time_ms integer not null check (user_time_ms >= 0),
  bot_score smallint not null check (bot_score between 0 and 100),
  outcome text not null check (outcome in ('win', 'loss', 'draw')),
  xp_awarded smallint not null check (xp_awarded >= 0),
  played_at timestamptz not null default now()
);

create index duel_results_user_id_idx on public.duel_results (user_id);
create index duel_results_played_at_idx on public.duel_results (played_at desc);

alter table public.duel_results enable row level security;

create policy "duel_results_select_own" on public.duel_results
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for the client: writes go only through
-- record_duel_result (security definer), same pattern as quiz_attempts
-- writes going through submit_quiz_attempt.

-- Records one duel result under the caller's own user_id. Unlike
-- submit_quiz_attempt, this does not validate module_id against the
-- caller's assigned path: a duel result only ever affects the caller's own
-- gamified stats, so a spoofed module_id has no blast radius beyond the
-- user's own numbers. Intentional simplification, not an oversight.
create or replace function public.record_duel_result(
  p_module_id smallint,
  p_question_ids text[],
  p_user_score smallint,
  p_user_time_ms integer,
  p_bot_score smallint,
  p_outcome text,
  p_xp_awarded smallint
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
  insert into public.duel_results
    (user_id, module_id, question_ids, user_score, user_time_ms, bot_score, outcome, xp_awarded)
    values
    (v_user_id, p_module_id, p_question_ids, p_user_score, p_user_time_ms, p_bot_score, p_outcome, p_xp_awarded)
    returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.record_duel_result from public;
grant execute on function public.record_duel_result to authenticated;

-- Returns only the caller's own rank + the total ranked player count —
-- never other users' rows. This is the one place this feature crosses the
-- owner-only RLS model, and only for a single aggregate number.
create or replace function public.get_duel_rank()
returns table (rank bigint, total_players bigint)
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
  return query
  with totals as (
    select user_id, sum(xp_awarded) as total_xp
    from public.duel_results
    group by user_id
  ),
  ranked as (
    select user_id, rank() over (order by total_xp desc) as rnk
    from totals
  )
  select
    coalesce((select rnk from ranked where user_id = v_user_id), 0)::bigint,
    (select count(*) from totals)::bigint;
end;
$$;

revoke all on function public.get_duel_rank from public;
grant execute on function public.get_duel_rank to authenticated;

-- Moves Marg out of public into its own schema, in place: every row, index,
-- constraint, RLS policy, grant and moddatetime trigger moves with its table.
-- See docs/shared-supabase-db.md, section 7 ("In-place move").
--
-- The live app breaks between this migration and the deploy that points the
-- clients at db: { schema: 'marg' } — ship both together.

alter table public.profiles              set schema marg;
alter table public.assessment_results    set schema marg;
alter table public.learning_paths        set schema marg;
alter table public.learning_path_modules set schema marg;
alter table public.unit_progress         set schema marg;
alter table public.quiz_attempts         set schema marg;
alter table public.build_progress        set schema marg;
alter table public.practice_progress     set schema marg;
alter table public.local_state_imports   set schema marg;
alter table public.duel_results          set schema marg;
alter table public.feedback              set schema marg;

-- Function bodies hardcode public.<table>, so the functions are recreated in
-- marg rather than moved. Logic is unchanged from the original migrations.
drop function public.submit_assessment(boolean, text, boolean, text, text, smallint[]);
drop function public.submit_quiz_attempt(uuid, text, smallint[], smallint);
drop function public.record_local_state_import(text);
drop function public.record_duel_result(smallint, text[], smallint, integer, smallint, text, smallint);
drop function public.get_duel_rank();
drop function public.submit_feedback(smallint, text, smallint, text);

create function marg.submit_assessment(
  p_beyond_drafting boolean,
  p_work_context text,
  p_built_workflow boolean,
  p_entry_level text,
  p_guidance_level text,
  p_module_ids smallint[]
)
returns uuid
language plpgsql
security definer
set search_path = marg, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_assessment_id uuid;
  v_path_id uuid;
  v_module_id smallint;
  v_position smallint := 1;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  update marg.assessment_results set is_current = false
    where user_id = v_user_id and is_current;

  insert into marg.assessment_results
    (user_id, beyond_drafting, work_context, built_workflow, entry_level, guidance_level, is_current)
    values
    (v_user_id, p_beyond_drafting, p_work_context, p_built_workflow, p_entry_level, p_guidance_level, true)
    returning id into v_assessment_id;

  update marg.learning_paths set status = 'superseded'
    where user_id = v_user_id and status = 'active';

  insert into marg.learning_paths (user_id, assessment_result_id, content_version, status)
    values (v_user_id, v_assessment_id, 1, 'active')
    returning id into v_path_id;

  foreach v_module_id in array p_module_ids loop
    insert into marg.learning_path_modules (path_id, user_id, module_id, position)
      values (v_path_id, v_user_id, v_module_id, v_position);
    v_position := v_position + 1;
  end loop;

  return v_path_id;
end;
$$;

create function marg.submit_quiz_attempt(
  p_path_id uuid,
  p_unit_id text,
  p_answers smallint[],
  p_score smallint
)
returns void
language plpgsql
security definer
set search_path = marg, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_next_attempt integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from marg.learning_paths
    where id = p_path_id and user_id = v_user_id and status = 'active'
  ) then
    raise exception 'path is not the caller''s active path';
  end if;

  select coalesce(max(attempt_number), 0) + 1 into v_next_attempt
    from marg.quiz_attempts
    where user_id = v_user_id and path_id = p_path_id and unit_id = p_unit_id;

  insert into marg.quiz_attempts
    (user_id, path_id, unit_id, attempt_number, answers, score)
    values (v_user_id, p_path_id, p_unit_id, v_next_attempt, p_answers, p_score);

  insert into marg.unit_progress (user_id, path_id, unit_id, status, started_at, completed_at)
    values (v_user_id, p_path_id, p_unit_id, 'completed', now(), now())
  on conflict (user_id, path_id, unit_id)
    do update set status = 'completed', completed_at = now();
end;
$$;

create function marg.record_local_state_import(p_idempotency_key text)
returns boolean -- true if this call recorded the import, false if already imported
language plpgsql
security definer
set search_path = marg, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into marg.local_state_imports (user_id, idempotency_key)
    values (v_user_id, p_idempotency_key)
    on conflict (user_id) do nothing;

  return found;
end;
$$;

create function marg.record_duel_result(
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
set search_path = marg, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  insert into marg.duel_results
    (user_id, module_id, question_ids, user_score, user_time_ms, bot_score, outcome, xp_awarded)
    values
    (v_user_id, p_module_id, p_question_ids, p_user_score, p_user_time_ms, p_bot_score, p_outcome, p_xp_awarded)
    returning id into v_id;
  return v_id;
end;
$$;

create function marg.get_duel_rank()
returns table (rank bigint, total_players bigint)
language plpgsql
security definer
set search_path = marg, extensions, pg_temp
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
    from marg.duel_results
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

create function marg.submit_feedback(
  p_rating smallint,
  p_message text,
  p_module_id smallint default null,
  p_unit_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = marg, extensions, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  insert into marg.feedback (user_id, rating, message, module_id, unit_id)
    values (
      v_user_id,
      p_rating,
      nullif(trim(p_message), ''),
      p_module_id,
      p_unit_id
    )
    returning id into v_id;
  return v_id;
end;
$$;

-- Same access as before: signed-in users only. Revoke anon explicitly, since
-- the schema's default privileges grant it on every new routine.
revoke all on function marg.submit_assessment(boolean, text, boolean, text, text, smallint[]) from public, anon;
revoke all on function marg.submit_quiz_attempt(uuid, text, smallint[], smallint) from public, anon;
revoke all on function marg.record_local_state_import(text) from public, anon;
revoke all on function marg.record_duel_result(smallint, text[], smallint, integer, smallint, text, smallint) from public, anon;
revoke all on function marg.get_duel_rank() from public, anon;
revoke all on function marg.submit_feedback(smallint, text, smallint, text) from public, anon;

grant execute on function marg.submit_assessment(boolean, text, boolean, text, text, smallint[]) to authenticated;
grant execute on function marg.submit_quiz_attempt(uuid, text, smallint[], smallint) to authenticated;
grant execute on function marg.record_local_state_import(text) to authenticated;
grant execute on function marg.record_duel_result(smallint, text[], smallint, integer, smallint, text, smallint) to authenticated;
grant execute on function marg.get_duel_rank() to authenticated;
grant execute on function marg.submit_feedback(smallint, text, smallint, text) to authenticated;

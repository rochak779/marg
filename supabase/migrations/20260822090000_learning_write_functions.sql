-- Phase C: trusted write paths for invariants that cross multiple tables.
-- These run SECURITY DEFINER (owned by postgres, which bypasses RLS) so they
-- can write to learning_paths/learning_path_modules, which intentionally
-- have no client INSERT policy (see section 7 of the implementation plan).
-- Every write is still manually scoped to auth.uid() inside the function
-- body, so a caller can only ever affect their own rows.

create or replace function public.submit_assessment(
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
set search_path = public
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

  update public.assessment_results set is_current = false
    where user_id = v_user_id and is_current;

  insert into public.assessment_results
    (user_id, beyond_drafting, work_context, built_workflow, entry_level, guidance_level, is_current)
    values
    (v_user_id, p_beyond_drafting, p_work_context, p_built_workflow, p_entry_level, p_guidance_level, true)
    returning id into v_assessment_id;

  update public.learning_paths set status = 'superseded'
    where user_id = v_user_id and status = 'active';

  insert into public.learning_paths (user_id, assessment_result_id, content_version, status)
    values (v_user_id, v_assessment_id, 1, 'active')
    returning id into v_path_id;

  foreach v_module_id in array p_module_ids loop
    insert into public.learning_path_modules (path_id, user_id, module_id, position)
      values (v_path_id, v_user_id, v_module_id, v_position);
    v_position := v_position + 1;
  end loop;

  return v_path_id;
end;
$$;

revoke all on function public.submit_assessment from public;
grant execute on function public.submit_assessment to authenticated;

-- Records one quiz attempt and marks the unit completed, atomically. The
-- score itself is computed by the Node server (curriculum lives in the repo,
-- not Postgres, per the plan's non-goal on moving curriculum into Postgres);
-- this function only trusts that pre-computed score for the given inputs
-- and enforces that the unit belongs to the caller's active path.
create or replace function public.submit_quiz_attempt(
  p_path_id uuid,
  p_unit_id text,
  p_answers smallint[],
  p_score smallint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_next_attempt integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.learning_paths
    where id = p_path_id and user_id = v_user_id and status = 'active'
  ) then
    raise exception 'path is not the caller''s active path';
  end if;

  select coalesce(max(attempt_number), 0) + 1 into v_next_attempt
    from public.quiz_attempts
    where user_id = v_user_id and path_id = p_path_id and unit_id = p_unit_id;

  insert into public.quiz_attempts
    (user_id, path_id, unit_id, attempt_number, answers, score)
    values (v_user_id, p_path_id, p_unit_id, v_next_attempt, p_answers, p_score);

  insert into public.unit_progress (user_id, path_id, unit_id, status, started_at, completed_at)
    values (v_user_id, p_path_id, p_unit_id, 'completed', now(), now())
  on conflict (user_id, path_id, unit_id)
    do update set status = 'completed', completed_at = now();
end;
$$;

revoke all on function public.submit_quiz_attempt from public;
grant execute on function public.submit_quiz_attempt to authenticated;

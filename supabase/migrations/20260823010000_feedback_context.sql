-- ---------------------------------------------------------------------------
-- feedback: add optional module_id/unit_id context. Lets us tell apart the
-- quiz-result-page prompt (Day 1/Day 2, early-insight signal) from generic
-- Settings > Help & feedback submissions, which stay null. Same nullable-
-- context pattern as unit_progress/quiz_attempts (module_id smallint,
-- unit_id text, no FK — modules/units are static content, not DB rows).
-- ---------------------------------------------------------------------------

alter table public.feedback
  add column module_id smallint,
  add column unit_id text;

create index feedback_unit_id_idx on public.feedback (unit_id)
  where unit_id is not null;

-- Signature is changing (two new params), not just the body, so drop first
-- rather than create-or-replace — avoids leaving an ambiguous overload of
-- the old 2-arg version behind.
drop function if exists public.submit_feedback(smallint, text);

create function public.submit_feedback(
  p_rating smallint,
  p_message text,
  p_module_id smallint default null,
  p_unit_id text default null
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
  insert into public.feedback (user_id, rating, message, module_id, unit_id)
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

revoke all on function public.submit_feedback(smallint, text, smallint, text)
  from public;
grant execute on function public.submit_feedback(smallint, text, smallint, text)
  to authenticated;

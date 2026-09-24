# Duels (Challenges) — Design Spec

Status: approved for implementation planning
Owner: engineering
Last reviewed: 22 August 2026

## 1. Decision

Build the "Duels" feature described in `design/mockups/challenge/Marg Landing.dc.html` screen `5b`
(list → brief → matchmaking → battle → result) as a bot-only head-to-head quiz mode,
scoped to modules the learner has reached. This ships now, ahead of the audio
narration and leaderboard/challenge-mode-vs-human items already flagged as
post-launch candidates in `docs/SUPABASE_IMPLEMENTATION_PLAN.md`.

Real Supabase auth and learning-progress persistence already exist on `main`
(Phase B/C/D migrations). This build reuses those conventions directly: owner-only
RLS, `security definer` RPCs for writes that cross the client's normal permissions,
and a small new table following the existing schema style.

## 2. Scope

### In scope
- One duel per module the learner has reached: eligible = `courseState(state, module)`
  returns `'Current'` or `'Complete'` (existing `lib/learning/progression.ts` logic,
  unchanged).
- Bot opponent only ("Marg Bot"). Every "Start challenge" match resolves against the
  bot — there is no live-user search.
- 5 questions per duel, drawn randomly (no replacement) from the eligible module's
  existing lesson quiz pool (15 questions/module: 5 lessons × 3 questions).
- Real Wins / Streak / Rank, computed server-side from a new Supabase table. Rank is
  a genuine cross-player computation (not faked), but is exposed to the client only
  as the caller's own `{rank, total_players}` — never other users' raw rows.
- New bottom-nav tab "Duels," positioned between Build and Settings.
- New `duel_results` table, RLS policies, and one `security definer` write RPC plus
  one `security definer` rank RPC, added as a new Supabase migration.

### Out of scope (unchanged from this build)
- Live human-vs-human matchmaking ("+N waiting," "N online," matched live opponent
  avatars). Stays exactly where `docs/SUPABASE_IMPLEMENTATION_PLAN.md` already flags
  it — Challenge mode vs. a live opponent needs Realtime shared state, matchmaking/
  invite design, and is explicitly a post-launch candidate. This build does not
  change that entry, it just adds a bot-only mode as the thing that ships now.
- Leaderboard *browsing* (a full ranked list of other learners). Only the caller's
  own rank/percentile is exposed — a browsable leaderboard is a separate, larger
  authorization surface and stays a post-launch candidate per the existing doc.
- A "missed questions review list." The mockup's "Marg saves them to your review
  list" CTA links to a feature that does not exist anywhere in this app today
  (`QuizResult.tsx` has no equivalent). The result screen shows a missed-question
  count as plain text with no CTA.
- Adaptive/skill-matched bot difficulty. Bot behavior is fixed-parameter, not
  learner-scaled.
- Audio narration — separately deferred, unrelated to this feature.

## 3. Data model

New migration, following the existing style in
`supabase/migrations/20260822080716_foundation_schema.sql`:

```sql
create table public.duel_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
```

RLS (owner-only, append-only — matches `quiz_attempts`):
```sql
alter table public.duel_results enable row level security;

create policy "duel_results_select_own" on public.duel_results
  for select using (auth.uid() = user_id);
-- No insert/update/delete policy for the client: writes go only through
-- record_duel_result (security definer), same pattern as quiz_attempts writes
-- going through submit_quiz_attempt.
```

Write RPC (`security definer`, mirrors `submit_quiz_attempt`):
```sql
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
```

Unlike `submit_quiz_attempt`, this function does not validate that `module_id` is on
the caller's assigned path — a duel result only ever affects the caller's own
gamified stats (wins/streak/rank), so a spoofed `module_id` has no blast radius
beyond the user's own numbers. This is an intentional simplification, not an
oversight.

Rank RPC (`security definer` — the one place this build crosses the owner-only
model, and only to return an aggregate about the caller, never other users' rows):
```sql
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
```

A user with zero duel history gets `rank = 0` (not ranked yet); the client renders
that as "Unranked" rather than "#0."

## 4. Server actions (`lib/learning/duel-actions.ts`, new file)

- `getDuelSummary()`: fetches wins/streak (derived from the caller's own
  `duel_results`, via a normal owner-scoped `select`, RLS-safe) plus rank via
  `get_duel_rank()`. Called on Duels-tab mount, same pattern as `loadSnapshot()`.
- `recordDuelResult(input)`: computes nothing server-side beyond what's passed in
  (same trust model as `submit_quiz_attempt` — the Node server computed the score,
  the RPC just persists it under the caller's own `auth.uid()`), calls
  `record_duel_result`.

## 5. Question selection & bot logic (`lib/learning/duel.ts`, new file — pure
functions, unit-testable like `progression.ts`)

- `eligibleDuelModules(state)`: modules where `courseState(state, module)` is
  `'Current'` or `'Complete'`. Current module is flagged separately so the UI can
  render it as the highlighted hero card.
- `pickDuelQuestions(module)`: flattens the module's lesson quiz questions (15 pool),
  shuffles, takes 5, no replacement.
- `BOT_ACCURACY = 0.7`, `BOT_MIN_DELAY_MS = 4000`, `BOT_MAX_DELAY_MS = 18000` (must
  stay under the 20s per-question cap) — named constants, easy to retune later.
- `resolveBotAnswer(question)`: returns `{correct, delayMs}` using the constants
  above.
- `scoreDuel(userAnswers, botAnswers, questions)`: 20 pts/correct answer each side
  (max 100); tie → faster total answer time wins; returns `{userScore, botScore,
  outcome}`.
- `xpForOutcome(outcome)`: `win → 60`, `draw → 40`, `loss → 20`.

## 6. UI / flow

Route: `app/app/duels/page.tsx` (client component, `useLearning()` pattern
identical to `BuildHub` in `app/app/build/page.tsx`). Screen state machine lives in
one component (or a small set under `components/learning/duels/`), matching the
mockup's screens 1:1 minus the live-match elements:

`list → brief → matching → battle → result`

- **list**: hero card for the current module's duel (visually matches the
  "Prompting fundamentals" card in `5b` — dark card, Start CTA). Completed modules'
  duels listed below as smaller rows. Modules not yet reached are absent entirely
  (no "locked" placeholder row — nothing to preview). Stats row shows real Wins /
  Streak / Rank (or "Unranked").
- **brief**: house rules copy from the mockup, unchanged. "Start challenge" begins
  matching.
- **matching**: bot-only — no real search. Short fixed delay (~1.5s) for pacing so
  the transition doesn't feel instant/jarring, then auto-advances to battle. Opponent
  shown is always "Marg Bot."
- **battle**: 20s per-question countdown, lock-on-answer, correct/incorrect marks
  revealed immediately (per house rule #3 — actually reveals per-question here,
  matching your earlier approved per-question-reveal decision on quizzes, not the
  mockup's "explanations after last question" copy — copy adjusted accordingly).
  Bot status line shows "Marg Bot is thinking…" then "Marg Bot answered
  correctly/incorrectly in Xs" once its randomized delay elapses.
- **result**: win/loss/draw title, score line (`{userScore} – {botScore}`), real
  Rank + Win Streak chips, missed-question count as plain text (no review-list CTA),
  "Rematch" (new duel, same module, fresh question draw) and "Back to challenges."

Nav: `components/learning/BottomNav.tsx` gets a 6th entry, "Duels," inserted between
Build and Settings, reusing the icon already drawn in the mockup (two overlapping
circular icons). Existing 5 tabs are otherwise unchanged.

## 7. Error handling

- No assigned path (`state.path` null): show the same "Create your path first" state
  `BuildHub` already uses, reusing that pattern.
- No eligible modules yet (learner hasn't started module 1): empty state, "Complete
  your first lesson to unlock Duels."
- `record_duel_result` failure (network/RPC error): result screen still renders from
  local computation (learner isn't blocked from seeing their result), but Wins/
  Streak/Rank shown are marked stale/retried on next tab visit rather than silently
  wrong — retry the write once in the background; if it still fails, surface a small
  inline "couldn't save this result" note rather than failing silently.
- Mid-battle navigation away: per house rule #2 in the mockup ("leaving mid-battle
  counts as a loss"), record a loss result if the learner navigates off the battle
  screen before all 5 questions are answered.

## 8. Testing

- Unit tests (`lib/learning/__tests__/duel.test.ts`, new): eligibility filtering
  against `courseState` outputs, question sampling (count, no duplicates), bot
  accuracy distribution over many trials stays near 0.7, scoring/tiebreak math, XP
  tiering.
- RLS test: a second user cannot `select` another user's `duel_results` rows
  directly; `get_duel_rank()` returns only `{rank, total_players}`, never per-user
  rows — matches the RLS test pattern the existing plan already calls for in
  section 7.
- Existing test suites (`assessment.test.ts`, `curriculum.test.ts`,
  `persistence.test.ts`, `progression.test.ts`) must still pass unchanged — this
  feature doesn't touch `LearningState`, `persistence.ts`, or curriculum content, so
  no expected impact. Full regression run (`vitest run` + `next build`) is part of
  the implementation plan's verification step, per the "don't break anything else"
  requirement.

## 9. Non-goals reaffirmed

This build does **not** change `docs/SUPABASE_IMPLEMENTATION_PLAN.md`'s existing
out-of-scope list. It adds one new capability (bot duels with real personal
Wins/Streak/Rank) without pulling forward Realtime, live matchmaking, or a
browsable leaderboard — all three remain explicitly deferred, unchanged from
before this feature.

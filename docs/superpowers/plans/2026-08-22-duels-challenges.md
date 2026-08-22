# Duels (Challenges) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a bot-only "Duels" quiz mode (list → brief → matching → battle → result), scoped to modules the learner has reached, with real Wins/Streak/Rank persisted in Supabase.

**Architecture:** A new Supabase table (`duel_results`) plus two `security definer` RPCs (write + rank) follow the existing owner-only-RLS pattern used by `quiz_attempts`/`submit_quiz_attempt`. A new pure-logic module (`lib/learning/duel.ts`) handles eligibility, question sampling, bot simulation, and scoring — unit-testable like `progression.ts`. Two new client components (`app/app/duels/page.tsx` for list/brief/matching, `components/learning/DuelBattle.tsx` for battle/result) follow the existing single-file-per-flow convention (`BuildHub`, `LessonView`). A 6th bottom-nav tab wires it in.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (Postgres + RLS + RPC), Vitest, plain CSS (no Tailwind — this repo hand-rolls classes against CSS custom properties in `app/globals.css`).

**Spec:** `docs/superpowers/specs/2026-08-22-duels-challenges-design.md`

## Global Constraints

- Bot opponent only ("Marg Bot") — no live human matchmaking. This stays out of scope; do not add matchmaking/search logic.
- Every new table gets owner-only RLS (`select`/`insert own`, no update/delete) — matches `quiz_attempts`. Client never writes directly; writes go through a `security definer` RPC.
- 5 questions per duel (`DUEL_QUESTION_COUNT`), drawn from the eligible module's existing lesson quiz pool (15 questions/module). No new content.
- `BOT_ACCURACY = 0.7`, `BOT_MIN_DELAY_MS = 4000`, `BOT_MAX_DELAY_MS = 18000`, `DUEL_QUESTION_SECONDS = 20`.
- XP: win → 60, draw → 40, loss → 20 (`XP_BY_OUTCOME`).
- Rank is exposed to the client only as the caller's own `{rank, total_players}` via `get_duel_rank()` — never another user's row. No browsable leaderboard.
- No "missed questions review list" CTA — the app has no such feature; show a plain missed-count line only.
- Nothing else in the app may regress: `npm run test`, `npm run typecheck`, and `npm run build` must all pass unchanged at the end.

---

### Task 1: Supabase migration — `duel_results` table, RLS, RPCs

**Files:**
- Create: `supabase/migrations/20260822110000_duel_results.sql`

**Interfaces:**
- Produces: table `public.duel_results`; RPCs `public.record_duel_result(p_module_id smallint, p_question_ids text[], p_user_score smallint, p_user_time_ms integer, p_bot_score smallint, p_outcome text, p_xp_awarded smallint) returns uuid`; `public.get_duel_rank() returns table(rank bigint, total_players bigint)`.

- [ ] **Step 1: Write the migration file**

```sql
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
```

- [ ] **Step 2: Verify locally if Docker is available**

Run: `supabase status`
If a local stack is running (or `supabase start` succeeds), run `supabase db reset` to apply all migrations including this one, and confirm it completes with no SQL errors. If Docker/local Supabase is not available in this environment, skip to Step 3 — the SQL above follows the exact structure of the existing `submit_quiz_attempt`/`quiz_attempts` migration in `supabase/migrations/20260822080716_foundation_schema.sql` and `supabase/migrations/20260822090000_learning_write_functions.sql`, so a careful read-through against those two files stands in for local verification. Flag in the task handoff whether this step ran live or was read-through-only.

- [ ] **Step 3: Verify RLS manually if a local stack is available**

No table in this repo has an automated multi-user RLS test today (checked:
none of `profiles`, `unit_progress`, `quiz_attempts`, etc. have one) — building
that harness from scratch is a bigger lift than this plan should absorb, so
this step is a manual check, matching the level of rigor already applied
elsewhere in the repo. If a local stack is running (see Step 2), open the
Supabase Studio SQL editor and run, as two different authenticated test
users:
1. As user A, call `select * from duel_results;` after inserting one row via
   `select record_duel_result(1, array['m1-monday-q1'], 60, 10000, 40, 'win', 60);` —
   confirm the row appears.
2. As user B, call `select * from duel_results;` — confirm user A's row does
   **not** appear.
3. As user B, call `select * from get_duel_rank();` — confirm it returns only
   `{rank, total_players}`, never user A's row directly.

If Docker/local Supabase isn't available, skip this and note it in the task
handoff — the policy SQL in Step 1 is structurally identical to the existing
`quiz_attempts_select_own` policy, which is the same trust level the rest of
the schema ships at.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260822110000_duel_results.sql
git commit -m "Add duel_results table, RLS, and record/rank RPCs for Duels"
```

---

### Task 2: Update generated Supabase types

**Files:**
- Modify: `lib/supabase/database.types.ts`

**Interfaces:**
- Consumes: the table/RPC shapes from Task 1.
- Produces: `Database['public']['Tables']['duel_results']` and `Database['public']['Functions']['record_duel_result' | 'get_duel_rank']` types, used by Task 4.

- [ ] **Step 1: If Docker/local Supabase is available, regenerate**

Run: `supabase gen types typescript --local > lib/supabase/database.types.ts`
Then run `git diff lib/supabase/database.types.ts` and confirm only additive changes (new `duel_results` table entry, new `get_duel_rank`/`record_duel_result` function entries) — no unrelated table changed. If this succeeds, skip Step 2 and go to Step 3.

- [ ] **Step 2: Otherwise, hand-edit to match the generated style exactly**

In `lib/supabase/database.types.ts`, find this exact block (the end of `build_progress`, right before `learning_path_modules` starts):

```typescript
      Relationships: [
          {
            foreignKeyName: "build_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_modules: {
```

Replace it with (inserting `duel_results` alphabetically between `build_progress` and `learning_path_modules`, matching every other table's exact formatting):

```typescript
      Relationships: [
          {
            foreignKeyName: "build_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      duel_results: {
        Row: {
          bot_score: number
          id: string
          module_id: number
          outcome: string
          played_at: string
          question_ids: string[]
          user_id: string
          user_score: number
          user_time_ms: number
          xp_awarded: number
        }
        Insert: {
          bot_score: number
          id?: string
          module_id: number
          outcome: string
          played_at?: string
          question_ids: string[]
          user_id: string
          user_score: number
          user_time_ms: number
          xp_awarded: number
        }
        Update: {
          bot_score?: number
          id?: string
          module_id?: number
          outcome?: string
          played_at?: string
          question_ids?: string[]
          user_id?: string
          user_score?: number
          user_time_ms?: number
          xp_awarded?: number
        }
        Relationships: []
      }
      learning_path_modules: {
```

Then find this exact block in the `Functions` section:

```typescript
    Functions: {
      record_local_state_import: {
        Args: { p_idempotency_key: string }
        Returns: boolean
      }
```

Replace it with (inserting alphabetically: `get_duel_rank`, then `record_duel_result`, before `record_local_state_import`):

```typescript
    Functions: {
      get_duel_rank: {
        Args: Record<PropertyKey, never>
        Returns: { rank: number; total_players: number }[]
      }
      record_duel_result: {
        Args: {
          p_bot_score: number
          p_module_id: number
          p_outcome: string
          p_question_ids: string[]
          p_user_score: number
          p_user_time_ms: number
          p_xp_awarded: number
        }
        Returns: string
      }
      record_local_state_import: {
        Args: { p_idempotency_key: string }
        Returns: boolean
      }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/database.types.ts
git commit -m "Add duel_results types and RPC signatures to generated database types"
```

---

### Task 3: Duel logic module (`lib/learning/duel.ts`)

**Files:**
- Create: `lib/learning/duel.ts`
- Test: `lib/learning/__tests__/duel.test.ts`

**Interfaces:**
- Consumes: `CurriculumModule`, `LearningState`, `LessonUnit`, `QuizQuestion` from `./types`; `assignedModules`, `courseState` from `./progression`.
- Produces (used by Tasks 4, 6, 7):
  - `BOT_NAME: string`, `DUEL_QUESTION_COUNT: number`, `DUEL_QUESTION_SECONDS: number`
  - `eligibleDuelModules(state: LearningState): { module: CurriculumModule; isCurrent: boolean }[]`
  - `pickDuelQuestions(module: CurriculumModule, random?: () => number): QuizQuestion[]`
  - `resolveBotAnswer(question: QuizQuestion, random?: () => number): { correct: boolean; delayMs: number }` (exported as type `BotAnswer`)
  - `scoreDuel(userCorrectCount: number, userTimeMs: number, botCorrectCount: number, botTimeMs: number): { userScore: number; botScore: number; outcome: DuelOutcome }` (type `DuelOutcome = 'win' | 'loss' | 'draw'`)
  - `xpForOutcome(outcome: DuelOutcome): number`

- [ ] **Step 1: Write the failing tests**

```typescript
// lib/learning/__tests__/duel.test.ts
import { describe, expect, it } from 'vitest';
import { curriculum } from '@/content/modules';
import { derivePath } from '../assessment';
import { completeUnit } from '../progression';
import { freshState } from '../persistence';
import {
  BOT_ACCURACY,
  DUEL_QUESTION_COUNT,
  eligibleDuelModules,
  pickDuelQuestions,
  resolveBotAnswer,
  scoreDuel,
  xpForOutcome,
} from '../duel';
import type { LearningState } from '../types';

function pathState(): LearningState {
  return {
    ...freshState(),
    path: derivePath({
      beyondDrafting: true,
      context: 'feedback',
      builtWorkflow: false,
    }),
  };
}

describe('eligibleDuelModules', () => {
  it('includes only the current module before any lesson is completed', () => {
    const eligible = eligibleDuelModules(pathState());
    expect(eligible).toHaveLength(1);
    expect(eligible[0].isCurrent).toBe(true);
  });

  it('adds a completed module once its units are done, keeping current flag correct', () => {
    let state = pathState();
    const firstModule = state.path!.assignedModuleIds[0];
    const module = curriculum.find((m) => m.id === firstModule)!;
    for (const unit of module.units) {
      state = completeUnit(state, unit.id);
    }
    const eligible = eligibleDuelModules(state);
    expect(eligible.length).toBeGreaterThanOrEqual(2);
    const completedEntry = eligible.find((e) => e.module.id === firstModule)!;
    expect(completedEntry.isCurrent).toBe(false);
    expect(eligible.filter((e) => e.isCurrent)).toHaveLength(1);
  });
});

describe('pickDuelQuestions', () => {
  it('draws DUEL_QUESTION_COUNT unique questions from the module pool', () => {
    const module = curriculum[0];
    const questions = pickDuelQuestions(module, () => 0.5);
    expect(questions).toHaveLength(DUEL_QUESTION_COUNT);
    expect(new Set(questions.map((q) => q.id)).size).toBe(DUEL_QUESTION_COUNT);
    const pool = new Set(
      module.units
        .filter((u) => u.kind === 'lesson')
        .flatMap((u) => u.quiz.map((q) => q.id)),
    );
    for (const q of questions) expect(pool.has(q.id)).toBe(true);
  });
});

describe('resolveBotAnswer', () => {
  it('stays near BOT_ACCURACY over many trials and within the time cap', () => {
    const module = curriculum[0];
    const question = module.units.find((u) => u.kind === 'lesson')!.quiz[0];
    let correct = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
      const answer = resolveBotAnswer(question, Math.random);
      if (answer.correct) correct += 1;
      expect(answer.delayMs).toBeGreaterThanOrEqual(4000);
      expect(answer.delayMs).toBeLessThanOrEqual(18000);
    }
    const rate = correct / trials;
    expect(rate).toBeGreaterThan(BOT_ACCURACY - 0.05);
    expect(rate).toBeLessThan(BOT_ACCURACY + 0.05);
  });
});

describe('scoreDuel', () => {
  it('scores 20 points per correct answer', () => {
    expect(scoreDuel(3, 10000, 2, 12000)).toMatchObject({
      userScore: 60,
      botScore: 40,
      outcome: 'win',
    });
  });

  it('breaks a tied score by speed', () => {
    expect(scoreDuel(3, 9000, 3, 15000).outcome).toBe('win');
    expect(scoreDuel(3, 15000, 3, 9000).outcome).toBe('loss');
  });

  it('draws on identical score and time', () => {
    expect(scoreDuel(3, 10000, 3, 10000).outcome).toBe('draw');
  });
});

describe('xpForOutcome', () => {
  it('awards 60/40/20 for win/draw/loss', () => {
    expect(xpForOutcome('win')).toBe(60);
    expect(xpForOutcome('draw')).toBe(40);
    expect(xpForOutcome('loss')).toBe(20);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/learning/__tests__/duel.test.ts`
Expected: FAIL — `../duel` does not exist yet.

- [ ] **Step 3: Write the implementation**

```typescript
// lib/learning/duel.ts
import { assignedModules, courseState } from './progression';
import type {
  CurriculumModule,
  LearningState,
  LessonUnit,
  QuizQuestion,
} from './types';

export const BOT_NAME = 'Marg Bot';
export const DUEL_QUESTION_COUNT = 5;
export const DUEL_QUESTION_SECONDS = 20;
export const BOT_ACCURACY = 0.7;
export const BOT_MIN_DELAY_MS = 4000;
export const BOT_MAX_DELAY_MS = 18000;

export type DuelOutcome = 'win' | 'loss' | 'draw';
export const XP_BY_OUTCOME: Record<DuelOutcome, number> = {
  win: 60,
  draw: 40,
  loss: 20,
};
const POINTS_PER_CORRECT = 20;

export interface EligibleDuelModule {
  module: CurriculumModule;
  isCurrent: boolean;
}
export interface BotAnswer {
  correct: boolean;
  delayMs: number;
}
export interface DuelScore {
  userScore: number;
  botScore: number;
  outcome: DuelOutcome;
}

export function eligibleDuelModules(
  state: LearningState,
): EligibleDuelModule[] {
  return assignedModules(state)
    .map((module) => ({ module, status: courseState(state, module) }))
    .filter((entry) => entry.status !== 'Upcoming')
    .map((entry) => ({
      module: entry.module,
      isCurrent: entry.status === 'Current',
    }));
}

export function pickDuelQuestions(
  module: CurriculumModule,
  random: () => number = Math.random,
): QuizQuestion[] {
  const pool = module.units
    .filter((unit): unit is LessonUnit => unit.kind === 'lesson')
    .flatMap((unit) => unit.quiz);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DUEL_QUESTION_COUNT);
}

export function resolveBotAnswer(
  question: QuizQuestion,
  random: () => number = Math.random,
): BotAnswer {
  void question;
  const correct = random() < BOT_ACCURACY;
  const delayMs = Math.round(
    BOT_MIN_DELAY_MS + random() * (BOT_MAX_DELAY_MS - BOT_MIN_DELAY_MS),
  );
  return { correct, delayMs };
}

export function scoreDuel(
  userCorrectCount: number,
  userTimeMs: number,
  botCorrectCount: number,
  botTimeMs: number,
): DuelScore {
  const userScore = userCorrectCount * POINTS_PER_CORRECT;
  const botScore = botCorrectCount * POINTS_PER_CORRECT;
  let outcome: DuelOutcome;
  if (userScore > botScore) outcome = 'win';
  else if (userScore < botScore) outcome = 'loss';
  else if (userTimeMs < botTimeMs) outcome = 'win';
  else if (userTimeMs > botTimeMs) outcome = 'loss';
  else outcome = 'draw';
  return { userScore, botScore, outcome };
}

export function xpForOutcome(outcome: DuelOutcome): number {
  return XP_BY_OUTCOME[outcome];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/learning/__tests__/duel.test.ts`
Expected: PASS, all cases green.

- [ ] **Step 5: Commit**

```bash
git add lib/learning/duel.ts lib/learning/__tests__/duel.test.ts
git commit -m "Add duel eligibility, question, bot, and scoring logic"
```

---

### Task 4: Duel server actions (`lib/learning/duel-actions.ts`)

**Files:**
- Create: `lib/learning/duel-actions.ts`
- Modify: `lib/learning/analytics.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`; `DUEL_QUESTION_COUNT` from `./duel`.
- Produces (used by Tasks 6, 7):
  - `type DuelSummary = { wins: number; streak: number; rank: number | null; totalPlayers: number }`
  - `getDuelSummary(): Promise<DuelSummary>`
  - `type DuelActionResult = { ok: true } | { ok: false; error: string }`
  - `recordDuelResult(input: unknown): Promise<DuelActionResult>`
  - `type RecordDuelResultInput` (the validated shape `recordDuelResult` expects — for callers to type against)

- [ ] **Step 1: Add the `duel_completed` analytics event**

In `lib/learning/analytics.ts`, change:
```typescript
export type LearningEvent =
  | 'assessment_completed'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'build_completed'
  | 'practice_completed'
  | 'assessment_retaken';
```
to:
```typescript
export type LearningEvent =
  | 'assessment_completed'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'build_completed'
  | 'practice_completed'
  | 'assessment_retaken'
  | 'duel_completed';
```

- [ ] **Step 2: Write `lib/learning/duel-actions.ts`**

```typescript
'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { DUEL_QUESTION_COUNT } from './duel';

export type DuelSummary = {
  wins: number;
  streak: number;
  rank: number | null;
  totalPlayers: number;
};

export type DuelActionResult = { ok: true } | { ok: false; error: string };

export async function getDuelSummary(): Promise<DuelSummary> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { wins: 0, streak: 0, rank: null, totalPlayers: 0 };

  const [{ data: results }, { data: rankRows }] = await Promise.all([
    supabase
      .from('duel_results')
      .select('outcome, played_at')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false }),
    supabase.rpc('get_duel_rank'),
  ]);

  const history = results ?? [];
  const wins = history.filter((row) => row.outcome === 'win').length;
  let streak = 0;
  for (const row of history) {
    if (row.outcome !== 'win') break;
    streak += 1;
  }
  const rankRow = rankRows?.[0];
  const rank = rankRow && rankRow.rank > 0 ? rankRow.rank : null;
  const totalPlayers = rankRow?.total_players ?? 0;
  return { wins, streak, rank, totalPlayers };
}

const recordDuelSchema = z.object({
  moduleId: z.number().int().positive(),
  questionIds: z.array(z.string()).length(DUEL_QUESTION_COUNT),
  userScore: z.number().int().min(0).max(100),
  userTimeMs: z.number().int().min(0),
  botScore: z.number().int().min(0).max(100),
  outcome: z.enum(['win', 'loss', 'draw']),
  xpAwarded: z.number().int().min(0),
});
// The function still takes `unknown` and validates defensively (it's a
// server action, reachable from any client), but callers can type-check
// what they build against this shape before passing it in.
export type RecordDuelResultInput = z.infer<typeof recordDuelSchema>;

export async function recordDuelResult(
  input: unknown,
): Promise<DuelActionResult> {
  const parsed = recordDuelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { error } = await supabase.rpc('record_duel_result', {
    p_module_id: parsed.data.moduleId,
    p_question_ids: parsed.data.questionIds,
    p_user_score: parsed.data.userScore,
    p_user_time_ms: parsed.data.userTimeMs,
    p_bot_score: parsed.data.botScore,
    p_outcome: parsed.data.outcome,
    p_xp_awarded: parsed.data.xpAwarded,
  });
  if (error) {
    console.error('record_duel_result failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }
  return { ok: true };
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (This is the first real consumer of the `duel_results` table/RPC types from Task 2 — if Task 2 was hand-edited rather than regenerated, a mismatch surfaces here.)

- [ ] **Step 4: Commit**

```bash
git add lib/learning/duel-actions.ts lib/learning/analytics.ts
git commit -m "Add duel server actions for recording results and fetching summary"
```

---

### Task 5: Add Duels tab to bottom nav

**Files:**
- Modify: `components/learning/BottomNav.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: route link to `/app/duels` (built in Task 6).

- [ ] **Step 1: Add the Duels entry**

In `components/learning/BottomNav.tsx`, change:
```typescript
  [
    'Build',
    '/app/build',
    <path key="b" d="M10 4h4v5l4 8a2 2 0 0 1-2 3H8a2 2 0 0 1-2-3l4-8Z" />,
  ],
  [
    'Settings',
```
to:
```typescript
  [
    'Build',
    '/app/build',
    <path key="b" d="M10 4h4v5l4 8a2 2 0 0 1-2 3H8a2 2 0 0 1-2-3l4-8Z" />,
  ],
  [
    'Duels',
    '/app/duels',
    <path key="d" d="M6 4h12M8 4v5a4 4 0 0 0 8 0V4M12 13v4M9 20h6" />,
  ],
  [
    'Settings',
```

- [ ] **Step 2: Build to catch type/JSX errors**

Run: `npm run typecheck`
Expected: no errors (route doesn't exist yet — that's fine, `Link href` isn't statically checked here; this step just confirms the tuple/JSX is valid).

- [ ] **Step 3: Commit**

```bash
git add components/learning/BottomNav.tsx
git commit -m "Add Duels tab to bottom nav, between Build and Settings"
```

---

### Task 6: Duels list/brief/matching screens (`app/app/duels/page.tsx`)

**Files:**
- Create: `app/app/duels/page.tsx`

**Interfaces:**
- Consumes: `useLearning` from `@/app/providers`; `eligibleDuelModules` from `@/lib/learning/duel`; `getDuelSummary`, `DuelSummary` from `@/lib/learning/duel-actions`; `Avatar` from `@/components/ui`; `DuelBattle` from `@/components/learning/DuelBattle` (built in Task 7 — this task can be written and typechecked once Task 7's component exists; do Task 7 first if executing out of written order, or stub `DuelBattle` locally and finish the wire-up at the end of Task 7).
- Produces: the `/app/duels` route, and calls into `DuelBattle` with props `{ module: CurriculumModule; onExit: () => void }`.

- [ ] **Step 1: Write the page**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { useLearning } from '@/app/providers';
import { eligibleDuelModules } from '@/lib/learning/duel';
import { getDuelSummary, type DuelSummary } from '@/lib/learning/duel-actions';
import { DuelBattle } from '@/components/learning/DuelBattle';
import type { CurriculumModule } from '@/lib/learning/types';

type Screen = 'list' | 'brief' | 'matching' | 'battle';

export default function DuelsHub() {
  const { state, ready } = useLearning();
  const [screen, setScreen] = useState<Screen>('list');
  const [selected, setSelected] = useState<CurriculumModule | null>(null);
  const [summary, setSummary] = useState<DuelSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getDuelSummary().then((result) => {
      if (!cancelled) setSummary(result);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (screen !== 'matching' || !selected) return;
    const timer = window.setTimeout(() => setScreen('battle'), 1500);
    return () => window.clearTimeout(timer);
  }, [screen, selected]);

  if (!ready) return <div className="state-message">Loading challenges…</div>;
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Create your path first.</h1>
        <p className="muted">Duels unlock once you have a learning path.</p>
        <Link className="btn" href="/assessment">
          Create my path
        </Link>
      </div>
    );

  const eligible = eligibleDuelModules(state);
  const current = eligible.find((entry) => entry.isCurrent);
  const completed = eligible.filter((entry) => !entry.isCurrent);

  if (screen === 'battle' && selected) {
    return (
      <DuelBattle
        module={selected}
        onExit={() => {
          setScreen('list');
          setSelected(null);
          setRefreshKey((key) => key + 1);
        }}
      />
    );
  }

  if (screen === 'matching' && selected) {
    return (
      <article className="duel-matching">
        <header className="duel-flow-header">
          <button
            type="button"
            onClick={() => setScreen('brief')}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span>Finding an opponent</span>
          <i />
        </header>
        <div className="duel-matching-vs">
          <div className="duel-matching-side">
            <Avatar seed={state.profile?.avatarSeed ?? 'you'} />
            <span>You</span>
          </div>
          <span className="duel-matching-vs-label">VS</span>
          <div className="duel-matching-side">
            <span className="duel-bot-avatar" aria-hidden="true">
              🤖
            </span>
            <span>Marg Bot</span>
          </div>
        </div>
        <p className="duel-matching-status">Matching you on level and topic…</p>
      </article>
    );
  }

  if (screen === 'brief' && selected) {
    return (
      <article className="duel-brief">
        <header className="duel-flow-header">
          <button
            type="button"
            onClick={() => setScreen('list')}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span>Daily duel</span>
          <i />
        </header>
        <p className="duel-brief-eyebrow">{selected.title.toUpperCase()}</p>
        <h1>
          Five questions.
          <br />
          Fastest correct wins.
        </h1>
        <p className="duel-brief-copy">
          20 seconds a question. Right answers score 20, speed breaks ties.
          You&apos;ll duel Marg Bot — live matchmaking with other learners is
          coming later.
        </p>
        <div className="duel-brief-stats">
          <div>
            <span>QUESTIONS</span>
            <strong>5</strong>
          </div>
          <div>
            <span>PER Q</span>
            <strong>20s</strong>
          </div>
          <div>
            <span>REWARD</span>
            <strong>60</strong>
          </div>
        </div>
        <div className="duel-house-rules">
          <p>HOUSE RULES</p>
          <ol>
            <li>One answer per question, locked when tapped.</li>
            <li>Leaving mid-battle counts as a loss.</li>
            <li>Right or wrong shows immediately after you answer.</li>
          </ol>
        </div>
        <footer>
          <button
            type="button"
            className="duel-primary-action"
            onClick={() => setScreen('matching')}
          >
            Start challenge <span aria-hidden="true">→</span>
          </button>
        </footer>
      </article>
    );
  }

  return (
    <div className="duel-hub">
      <header className="duel-hub-header">
        <div className="duel-hub-brand">
          <Link href="/app/settings" aria-label="Open settings">
            {state.profile?.avatarSeed ? (
              <Avatar seed={state.profile.avatarSeed} />
            ) : (
              <span>म</span>
            )}
          </Link>
          <b>Challenges</b>
        </div>
      </header>
      <div className="duel-hub-stats">
        <div className="duel-stat duel-stat-purple">
          <span>WINS</span>
          <strong>{summary?.wins ?? 0}</strong>
        </div>
        <div className="duel-stat duel-stat-orange">
          <span>STREAK</span>
          <strong>{summary?.streak ?? 0}</strong>
        </div>
        <div className="duel-stat duel-stat-orange">
          <span>RANK</span>
          <strong>{summary?.rank ? `#${summary.rank}` : '—'}</strong>
        </div>
      </div>
      <div className="duel-hub-list">
        <h2>Open challenges</h2>
        {eligible.length === 0 && (
          <p className="duel-empty">
            Complete your first lesson to unlock Duels.
          </p>
        )}
        {current && (
          <div
            className="duel-hero-card"
            onClick={() => {
              setSelected(current.module);
              setScreen('brief');
            }}
          >
            <span className="duel-hero-eyebrow">DAILY DUEL</span>
            <h3>{current.module.title}</h3>
            <p>5 questions · 20s each · 60 XP</p>
            <span className="duel-hero-cta">Start</span>
          </div>
        )}
        {completed.map((entry) => (
          <div
            className="duel-list-card"
            key={entry.module.id}
            onClick={() => {
              setSelected(entry.module);
              setScreen('brief');
            }}
          >
            <div>
              <b>{entry.module.title}</b>
              <p>5 questions · 60 XP</p>
            </div>
            <span aria-hidden="true">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck (once Task 7's `DuelBattle` exists)**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/app/duels/page.tsx
git commit -m "Add Duels list, brief, and matching screens"
```

---

### Task 7: Battle and result screens (`components/learning/DuelBattle.tsx`)

**Files:**
- Create: `components/learning/DuelBattle.tsx`

**Interfaces:**
- Consumes: `DUEL_QUESTION_SECONDS`, `BOT_NAME`, `pickDuelQuestions`, `resolveBotAnswer`, `scoreDuel`, `xpForOutcome`, `BotAnswer`, `DuelOutcome` from `@/lib/learning/duel`; `getDuelSummary`, `recordDuelResult`, `DuelSummary` from `@/lib/learning/duel-actions`; `CurriculumModule`, `QuizQuestion` from `@/lib/learning/types`.
- Produces: `DuelBattle({ module, onExit }: { module: CurriculumModule; onExit: () => void })` — consumed by Task 6.

**Known, documented limitations** (call these out in the PR description, don't try to fix them here — they're accepted tradeoffs from the spec):
- The mid-battle-exit loss is recorded on React unmount (in-app navigation), not on a full tab close/refresh — `beforeunload` can't reliably await a network write, and the spec doesn't ask for that case. That fire-and-forget write also isn't retried (unlike a normal battle-completion save) — there's no mounted component left to retry from.
- Per-question answer timing has ~250ms precision (the tick interval), not millisecond precision — fine for a tiebreaker, not exact.
- A normal (non-exit) save retries once; if both attempts fail, the result screen still shows the locally-computed score but surfaces an inline "couldn't save this result" note (`saveError`), matching spec section 7.

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BOT_NAME,
  DUEL_QUESTION_SECONDS,
  pickDuelQuestions,
  resolveBotAnswer,
  scoreDuel,
  xpForOutcome,
  type BotAnswer,
  type DuelOutcome,
} from '@/lib/learning/duel';
import {
  getDuelSummary,
  recordDuelResult,
  type DuelSummary,
  type RecordDuelResultInput,
} from '@/lib/learning/duel-actions';
import type { CurriculumModule, QuizQuestion } from '@/lib/learning/types';

type Phase = 'battle' | 'result';

function buildBotAnswers(questions: QuizQuestion[]): BotAnswer[] {
  return questions.map((question) => resolveBotAnswer(question));
}

export function DuelBattle({
  module,
  onExit,
}: {
  module: CurriculumModule;
  onExit: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    pickDuelQuestions(module),
  );
  const [botAnswers, setBotAnswers] = useState<BotAnswer[]>(() =>
    buildBotAnswers(questions),
  );
  const [phase, setPhase] = useState<Phase>('battle');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>(() =>
    questions.map(() => -1),
  );
  const [userAnswerMs, setUserAnswerMs] = useState<number[]>(() =>
    questions.map(() => 0),
  );
  const [questionStartAt, setQuestionStartAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState<{
    userScore: number;
    botScore: number;
    outcome: DuelOutcome;
    xp: number;
  } | null>(null);
  const [summary, setSummary] = useState<DuelSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Ticks while a question is live: drives the countdown and the bot's
  // "thinking…" -> "answered" status line.
  useEffect(() => {
    if (phase !== 'battle') return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [phase, questionIndex]);

  const elapsedMs = now - questionStartAt;
  const secondsLeft = Math.max(
    0,
    DUEL_QUESTION_SECONDS - Math.floor(elapsedMs / 1000),
  );
  const answered = userAnswers[questionIndex] >= 0;
  const timedOut = !answered && secondsLeft === 0;
  const locked = answered || timedOut;
  const currentQuestion = questions[questionIndex];
  const currentBotAnswer = botAnswers[questionIndex];
  const botHasAnswered = elapsedMs >= currentBotAnswer.delayMs;

  function finishBattle(finalAnswers: number[], finalTimes: number[]) {
    const userCorrect = finalAnswers.filter(
      (answer, index) => answer === questions[index].correctIndex,
    ).length;
    const botCorrect = botAnswers.filter((bot) => bot.correct).length;
    const userTimeMs = finalTimes.reduce((sum, ms) => sum + ms, 0);
    const botTimeMs = botAnswers.reduce((sum, bot) => sum + bot.delayMs, 0);
    const { userScore, botScore, outcome } = scoreDuel(
      userCorrect,
      userTimeMs,
      botCorrect,
      botTimeMs,
    );
    const xp = xpForOutcome(outcome);
    setResult({ userScore, botScore, outcome, xp });
    setPhase('result');
    void saveResult({
      moduleId: module.id,
      questionIds: questions.map((question) => question.id),
      userScore,
      userTimeMs,
      botScore,
      outcome,
      xpAwarded: xp,
    });
  }

  // Persists a duel result, retrying once before giving up. The result
  // screen always renders from the local computation regardless of whether
  // this succeeds — a failed write only surfaces as a small inline note and
  // stale Wins/Streak/Rank, never a blocked result screen.
  async function saveResult(input: RecordDuelResultInput) {
    setSaving(true);
    setSaveError(false);
    let outcome = await recordDuelResult(input);
    if (!outcome.ok) {
      outcome = await recordDuelResult(input);
    }
    setSaving(false);
    if (!outcome.ok) {
      setSaveError(true);
      return;
    }
    const nextSummary = await getDuelSummary();
    setSummary(nextSummary);
  }

  // Auto-lock the question as unanswered once the clock runs out.
  useEffect(() => {
    if (phase !== 'battle' || answered || secondsLeft > 0) return;
    const nextTimes = userAnswerMs.map((value, index) =>
      index === questionIndex ? DUEL_QUESTION_SECONDS * 1000 : value,
    );
    setUserAnswerMs(nextTimes);
    if (questionIndex === questions.length - 1) {
      finishBattle(userAnswers, nextTimes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, answered, secondsLeft, questionIndex]);

  // Record a loss if the learner leaves mid-battle (house rule #2). Reads
  // the latest state via a ref so the cleanup below (registered once on
  // mount) doesn't act on stale closure values captured at mount time.
  const exitStateRef = useRef({ phase, module, questions });
  useEffect(() => {
    exitStateRef.current = { phase, module, questions };
  });
  useEffect(() => {
    return () => {
      const exitState = exitStateRef.current;
      if (exitState.phase === 'battle') {
        void recordDuelResult({
          moduleId: exitState.module.id,
          questionIds: exitState.questions.map((question) => question.id),
          userScore: 0,
          userTimeMs: 0,
          botScore: 100,
          outcome: 'loss',
          xpAwarded: xpForOutcome('loss'),
        });
      }
    };
  }, []);

  const selectAnswer = (optionIndex: number) => {
    if (locked) return;
    const timeMs = Math.min(DUEL_QUESTION_SECONDS * 1000, elapsedMs);
    const nextAnswers = userAnswers.map((value, index) =>
      index === questionIndex ? optionIndex : value,
    );
    const nextTimes = userAnswerMs.map((value, index) =>
      index === questionIndex ? timeMs : value,
    );
    setUserAnswers(nextAnswers);
    setUserAnswerMs(nextTimes);
    if (questionIndex === questions.length - 1) {
      finishBattle(nextAnswers, nextTimes);
    }
  };

  const goNext = () => {
    setQuestionIndex((index) => index + 1);
    setQuestionStartAt(Date.now());
    setNow(Date.now());
  };

  const startRematch = () => {
    const nextQuestions = pickDuelQuestions(module);
    setQuestions(nextQuestions);
    setBotAnswers(buildBotAnswers(nextQuestions));
    setUserAnswers(nextQuestions.map(() => -1));
    setUserAnswerMs(nextQuestions.map(() => 0));
    setQuestionIndex(0);
    setQuestionStartAt(Date.now());
    setNow(Date.now());
    setResult(null);
    setSummary(null);
    setPhase('battle');
  };

  if (phase === 'result' && result) {
    const title =
      result.outcome === 'win'
        ? 'Victory'
        : result.outcome === 'loss'
          ? 'Defeat'
          : 'Draw';
    const missedCount = questions.filter(
      (question, index) => userAnswers[index] !== question.correctIndex,
    ).length;
    return (
      <article className="duel-result">
        <h1>{title}</h1>
        <p className="duel-result-score">
          {result.userScore} – {result.botScore}
        </p>
        <p className="duel-result-xp">+{result.xp} XP</p>
        <div className="duel-result-chips">
          <span>{summary?.rank ? `Rank #${summary.rank}` : 'Unranked'}</span>
          <span>Win streak {summary?.streak ?? 0}</span>
        </div>
        {missedCount > 0 && (
          <p className="duel-result-missed">
            You missed {missedCount} question{missedCount === 1 ? '' : 's'}.
          </p>
        )}
        {saveError && (
          <p className="duel-result-save-error">
            Couldn&apos;t save this result — your Wins/Streak/Rank may be out
            of date until your next duel.
          </p>
        )}
        <footer className="duel-result-actions">
          <button
            type="button"
            className="duel-primary-action"
            onClick={startRematch}
            disabled={saving}
          >
            Rematch <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="duel-text-action" onClick={onExit}>
            Back to challenges
          </button>
        </footer>
      </article>
    );
  }

  return (
    <article className="duel-battle">
      <header className="duel-battle-header">
        <div>
          <span>You</span>
          <strong>
            {userAnswers.filter(
              (answer, index) => answer === questions[index]?.correctIndex,
            ).length * 20}
          </strong>
        </div>
        <div className="duel-battle-timer">
          <span>
            QUESTION {questionIndex + 1} OF {questions.length}
          </span>
          <span>{secondsLeft}s</span>
        </div>
        <div>
          <span>{BOT_NAME}</span>
          <strong>
            {botAnswers
              .slice(0, questionIndex + (botHasAnswered ? 1 : 0))
              .filter((bot) => bot.correct).length * 20}
          </strong>
        </div>
      </header>

      <section className="duel-question">
        <h2>{currentQuestion.prompt}</h2>
        <div className="duel-options">
          {currentQuestion.options.map((option, optionIndex) => {
            const isCorrect =
              locked && optionIndex === currentQuestion.correctIndex;
            const isWrong =
              locked &&
              optionIndex === userAnswers[questionIndex] &&
              optionIndex !== currentQuestion.correctIndex;
            return (
              <button
                type="button"
                key={option}
                className={`duel-option ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                disabled={locked}
                onClick={() => selectAnswer(optionIndex)}
              >
                <span className="duel-option-letter">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        <p className="duel-bot-line">
          {botHasAnswered
            ? `${BOT_NAME} answered ${currentBotAnswer.correct ? 'correctly' : 'incorrectly'} in ${Math.round(currentBotAnswer.delayMs / 1000)}s`
            : `${BOT_NAME} is thinking…`}
        </p>
      </section>

      <footer className="duel-battle-footer">
        {locked && questionIndex < questions.length - 1 && (
          <button
            type="button"
            className="duel-primary-action"
            onClick={goNext}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        )}
        {!locked && <p className="duel-waiting">Answer to continue</p>}
      </footer>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/learning/DuelBattle.tsx
git commit -m "Add Duel battle and result screens with bot simulation"
```

---

### Task 8: Duel styles

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: existing custom properties `--purple`, `--purple-dark`, `--orange`, `--peach`, `--ink`, `--muted`, `--dark`, `--line`, `--surface` (defined in `:root` near the top of the file).
- Produces: all `.duel-*` classes referenced in Tasks 6 and 7.

- [ ] **Step 1: Append the Duels stylesheet block to the end of `app/globals.css`**

```css
/* Duels ------------------------------------------------------------------ */
.duel-hub {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}
.duel-hub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.duel-hub-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}
.duel-hub-stats {
  display: flex;
  gap: 8px;
}
.duel-stat {
  flex: 1;
  padding: 12px 13px;
  border-radius: 18px;
  background: var(--surface);
}
.duel-stat-purple {
  background: #e4e7fd;
}
.duel-stat-orange {
  background: #fceae0;
}
.duel-stat span {
  display: block;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
  color: var(--purple-dark);
}
.duel-stat strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}
.duel-hub-list h2 {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  margin: 4px 0 12px;
}
.duel-empty {
  font-size: 13px;
  color: var(--muted);
}
.duel-hero-card {
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 24px;
  background: var(--dark);
  color: #f8f8f8;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.duel-hero-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.1px;
  color: var(--orange);
}
.duel-hero-card h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}
.duel-hero-card p {
  font-size: 11.5px;
  color: rgba(248, 248, 248, 0.6);
  margin: 0;
}
.duel-hero-cta {
  align-self: flex-start;
  margin-top: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--peach);
  color: var(--ink);
  font-size: 12.5px;
  font-weight: 700;
}
.duel-list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
  border-radius: 22px;
  background: #fff;
  border: 1.4px solid var(--line);
  cursor: pointer;
  margin-bottom: 10px;
}
.duel-list-card b {
  font-size: 13.5px;
  color: var(--ink);
}
.duel-list-card p {
  font-size: 11.5px;
  color: var(--muted);
  margin: 2px 0 0;
}
.duel-flow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
}
.duel-flow-header button {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 3px 10px rgba(20, 20, 30, 0.07);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.duel-flow-header button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--ink);
  stroke-width: 2;
}
.duel-flow-header span {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--muted);
}
.duel-brief-eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1.4px;
  color: var(--orange);
}
.duel-brief h1 {
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--ink);
  margin: 8px 0;
}
.duel-brief-copy {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--muted);
}
.duel-brief-stats {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}
.duel-brief-stats div {
  flex: 1;
  padding: 12px 13px;
  border-radius: 18px;
  background: #fceae0;
}
.duel-brief-stats span {
  display: block;
  font-size: 9.5px;
  font-weight: 600;
  color: #8a6248;
}
.duel-brief-stats strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin-top: 2px;
}
.duel-house-rules {
  padding: 14px 16px;
  border-radius: 20px;
  background: #fff;
  border: 1.4px solid var(--line);
}
.duel-house-rules p {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.9px;
  color: var(--muted);
  margin: 0 0 10px;
}
.duel-house-rules ol {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.45;
  color: #3a3c44;
}
.duel-house-rules li {
  margin-bottom: 8px;
}
.duel-primary-action {
  height: 54px;
  width: 100%;
  border-radius: 999px;
  background: var(--dark);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  box-shadow: 0 6px 20px rgba(20, 20, 30, 0.2);
  cursor: pointer;
  margin-top: 14px;
}
.duel-primary-action:disabled {
  opacity: 0.6;
  cursor: default;
}
.duel-text-action {
  background: none;
  border: none;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
}
.duel-matching {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 16px 0 24px;
}
.duel-matching-vs {
  display: flex;
  align-items: center;
  gap: 18px;
}
.duel-matching-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 600;
}
.duel-matching-side img {
  width: 74px;
  height: 74px;
  border-radius: 999px;
}
.duel-bot-avatar {
  width: 74px;
  height: 74px;
  border-radius: 999px;
  background: #a5adf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
}
.duel-matching-vs-label {
  font-size: 20px;
  font-weight: 700;
  color: var(--orange);
}
.duel-matching-status {
  font-size: 12.5px;
  color: var(--muted);
}
.duel-battle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px;
}
.duel-battle-header > div:first-child,
.duel-battle-header > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}
.duel-battle-header strong {
  font-size: 15px;
}
.duel-battle-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--muted);
}
.duel-battle-timer span:last-child {
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(253, 163, 102, 0.18);
  color: var(--orange);
  font-weight: 700;
}
.duel-question h2 {
  font-size: 18px;
  line-height: 1.32;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 16px;
}
.duel-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.duel-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #fff;
  border: 1.4px solid var(--line);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}
.duel-option.is-correct {
  border-color: #3e8b5e;
  background: #e1f3e7;
}
.duel-option.is-wrong {
  border-color: #d9534f;
  background: #fbe4e3;
}
.duel-option-letter {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex: none;
}
.duel-bot-line {
  font-size: 12px;
  color: var(--muted);
  margin-top: 14px;
}
.duel-battle-footer {
  padding-top: 16px;
}
.duel-waiting {
  height: 54px;
  border-radius: 999px;
  background: #dedee2;
  color: #9a9aa0;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}
.duel-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 40px 12px;
}
.duel-result h1 {
  font-size: 27px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}
.duel-result-score {
  font-size: 32px;
  font-weight: 700;
  color: var(--orange);
  margin: 0;
}
.duel-result-xp {
  font-size: 13px;
  font-weight: 600;
  color: var(--purple-dark);
  margin: 0;
}
.duel-result-chips {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.duel-result-chips span {
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(252, 209, 151, 0.3);
  font-size: 11.5px;
  font-weight: 600;
  color: #8a6248;
}
.duel-result-missed {
  font-size: 12px;
  color: var(--muted);
  margin-top: 12px;
}
.duel-result-save-error {
  font-size: 11.5px;
  color: #d9534f;
  margin-top: 8px;
}
.duel-result-actions {
  width: 100%;
  margin-top: 24px;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "Add Duels screen styles"
```

---

### Task 9: Full regression and manual smoke check

**Files:** none created — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: every existing suite (`assessment.test.ts`, `curriculum.test.ts`, `persistence.test.ts`, `progression.test.ts`) still passes unchanged, plus the new `duel.test.ts` passes. If anything outside `duel.test.ts` fails, stop and fix it before continuing — nothing else in the app should have moved.

- [ ] **Step 2: Typecheck and lint the whole repo**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds, `/app/duels` appears in the route output, no new warnings tied to the files touched in this plan.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`, then in the browser:
1. Sign in as a learner with at least one completed lesson (or complete one) so a module is eligible.
2. Open the Duels tab (between Build and Settings) — confirm the current module's duel appears as the highlighted hero card, Wins/Streak/Rank render (0 / 0 / — for a first-time user).
3. Tap into the brief, start a challenge, let the matching screen auto-advance (~1.5s) into battle.
4. Answer all 5 questions (mix of correct/incorrect, and let one time out if convenient) — confirm the bot status line, the correct/incorrect reveal, and the countdown all behave.
5. Confirm the result screen shows a real score line, XP, and updated Rank/Streak; tap Rematch, then Back to challenges — confirm Wins/Streak/Rank on the list screen reflect the just-played match.
6. Start a new duel and navigate away mid-battle (e.g. tap Home) — return to Duels and confirm a loss was recorded (Wins/Streak/Rank updated accordingly on next load).
7. Click through every other tab (Home, Courses, Progress, Build, Settings) to confirm nothing else visually or functionally regressed.

- [ ] **Step 5: Final commit (if smoke-check turned up fixes)**

```bash
git add -A
git commit -m "Fix issues found in Duels smoke check"
```

If no fixes were needed, this step is a no-op — the feature is done as of Task 8's commit.

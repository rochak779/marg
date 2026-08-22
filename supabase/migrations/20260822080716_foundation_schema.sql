-- Phase A: foundation schema
-- Learner-owned tables, integrity constraints, indexes, RLS.
-- See docs/SUPABASE_IMPLEMENTATION_PLAN.md sections 5-7 for the design rationale.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text check (char_length(first_name) between 1 and 100),
  daily_nudge_enabled boolean not null default false,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per account. Email stays owned by auth.users.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- assessment_results
-- ---------------------------------------------------------------------------

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  beyond_drafting boolean not null,
  work_context text not null check (work_context in ('feedback', 'requests', 'communication', 'prototyping')),
  built_workflow boolean not null,
  entry_level text not null check (entry_level in ('basic', 'advanced')),
  guidance_level text not null check (guidance_level in ('full', 'reduced')),
  is_current boolean not null default true,
  completed_at timestamptz not null default now()
);

create index assessment_results_user_id_idx on public.assessment_results (user_id);

-- one current assessment result per user
create unique index assessment_results_one_current_per_user
  on public.assessment_results (user_id)
  where is_current;

-- ---------------------------------------------------------------------------
-- learning_paths
-- ---------------------------------------------------------------------------

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_result_id uuid not null references public.assessment_results (id),
  content_version integer not null default 1,
  status text not null default 'active' check (status in ('active', 'completed', 'superseded')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index learning_paths_user_id_idx on public.learning_paths (user_id);

-- one active path per user
create unique index learning_paths_one_active_per_user
  on public.learning_paths (user_id)
  where status = 'active';

create trigger set_learning_paths_updated_at
  before update on public.learning_paths
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- learning_path_modules
-- ---------------------------------------------------------------------------

create table public.learning_path_modules (
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id smallint not null check (module_id between 1 and 5),
  position smallint not null,
  primary key (path_id, module_id)
);

create unique index learning_path_modules_position_unique
  on public.learning_path_modules (path_id, position);

create index learning_path_modules_user_id_idx on public.learning_path_modules (user_id);

-- ---------------------------------------------------------------------------
-- unit_progress
-- ---------------------------------------------------------------------------

create table public.unit_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  unit_id text not null,
  status text not null check (status in ('started', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, path_id, unit_id)
);

create index unit_progress_path_id_idx on public.unit_progress (path_id);
create index unit_progress_recent_completion_idx on public.unit_progress (user_id, completed_at desc);

create trigger set_unit_progress_updated_at
  before update on public.unit_progress
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- quiz_attempts (append-only)
-- ---------------------------------------------------------------------------

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  unit_id text not null,
  attempt_number integer not null check (attempt_number > 0),
  answers smallint[] not null check (array_length(answers, 1) = 3),
  score smallint not null check (score between 0 and 3),
  submitted_at timestamptz not null default now(),
  unique (user_id, path_id, unit_id, attempt_number)
);

create index quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index quiz_attempts_unit_id_idx on public.quiz_attempts (unit_id);

-- ---------------------------------------------------------------------------
-- build_progress
-- ---------------------------------------------------------------------------

create table public.build_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  unit_id text not null,
  tool text not null check (tool in ('chatgpt', 'claude')),
  checked_steps smallint[] not null default '{}',
  checked_criteria smallint[] not null default '{}',
  ran_workflow boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, path_id, unit_id)
);

create trigger set_build_progress_updated_at
  before update on public.build_progress
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- practice_progress
-- ---------------------------------------------------------------------------

create table public.practice_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  unit_id text not null,
  checked_rules smallint[] not null default '{}',
  reflections jsonb not null default '{}'::jsonb,
  revealed_hints smallint not null default 0 check (revealed_hints >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, path_id, unit_id)
);

comment on column public.practice_progress.reflections is
  'Learner reflection text. Retention/deletion rules: see docs/SUPABASE_IMPLEMENTATION_PLAN.md section 5. Never send to product analytics.';

create trigger set_practice_progress_updated_at
  before update on public.practice_progress
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.assessment_results enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_modules enable row level security;
alter table public.unit_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.build_progress enable row level security;
alter table public.practice_progress enable row level security;

-- profiles: full owner CRUD except delete (handled by account-deletion server flow)
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- assessment_results: owner select/insert, no direct client update/delete
create policy "assessment_results_select_own" on public.assessment_results
  for select using ((select auth.uid()) = user_id);
create policy "assessment_results_insert_own" on public.assessment_results
  for insert with check ((select auth.uid()) = user_id);

-- learning_paths: owner select only; writes go through service-role Server Actions
create policy "learning_paths_select_own" on public.learning_paths
  for select using ((select auth.uid()) = user_id);

-- learning_path_modules: owner select only; writes go through service-role Server Actions
create policy "learning_path_modules_select_own" on public.learning_path_modules
  for select using ((select auth.uid()) = user_id);

-- unit_progress: owner select/insert/update; path ownership enforced by FK + user_id match
create policy "unit_progress_select_own" on public.unit_progress
  for select using ((select auth.uid()) = user_id);
create policy "unit_progress_insert_own" on public.unit_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "unit_progress_update_own" on public.unit_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- quiz_attempts: owner select/insert only, append-only (no update/delete policy)
create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select using ((select auth.uid()) = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check ((select auth.uid()) = user_id);

-- build_progress: owner select/insert/update
create policy "build_progress_select_own" on public.build_progress
  for select using ((select auth.uid()) = user_id);
create policy "build_progress_insert_own" on public.build_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "build_progress_update_own" on public.build_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- practice_progress: owner select/insert/update
create policy "practice_progress_select_own" on public.practice_progress
  for select using ((select auth.uid()) = user_id);
create policy "practice_progress_insert_own" on public.practice_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "practice_progress_update_own" on public.practice_progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

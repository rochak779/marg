'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { curriculum } from '@/content/modules';
import { derivePath } from './assessment';
import { freshState } from './persistence';
import { DEFAULT_AVATAR_SEED } from '@/lib/avatar';
import type {
  AppliedContext,
  AssessmentAnswers,
  BuildProgress,
  LearningState,
  PracticeProgress,
} from './types';

export type ActionResult =
  | { ok: true; state: LearningState }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// loadSnapshot: reassembles Supabase rows back into the LearningState shape
// the app already uses, so progression.ts and every view component keep
// working unchanged.
// ---------------------------------------------------------------------------

export async function loadSnapshot(): Promise<LearningState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return freshState();

  const [{ data: profile }, { data: assessment }, { data: path }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('first_name, avatar_seed')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_current', true)
        .maybeSingle(),
      supabase
        .from('learning_paths')
        .select(
          '*, learning_path_modules(module_id, position), assessment_results(entry_level, guidance_level)',
        )
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle(),
    ]);

  const state = freshState();
  state.profile = {
    firstName: profile?.first_name ?? user.email?.split('@')[0] ?? 'Learner',
    email: user.email ?? '',
    avatarSeed: profile?.avatar_seed ?? DEFAULT_AVATAR_SEED,
  };

  if (assessment) {
    state.assessment = {
      beyondDrafting: assessment.beyond_drafting,
      context: assessment.work_context as AppliedContext,
      builtWorkflow: assessment.built_workflow,
    };
  }

  if (!path) return state;

  const modules = (path.learning_path_modules ?? []).sort(
    (a, b) => a.position - b.position,
  );
  const pathAssessment = Array.isArray(path.assessment_results)
    ? path.assessment_results[0]
    : path.assessment_results;
  state.path = {
    entryLevel: (pathAssessment?.entry_level ?? 'basic') as 'basic' | 'advanced',
    guidanceLevel: (pathAssessment?.guidance_level ?? 'full') as
      | 'full'
      | 'reduced',
    assignedModuleIds: modules.map((module) => module.module_id),
  };

  const [{ data: units }, { data: attempts }, { data: builds }, { data: practices }] =
    await Promise.all([
      supabase
        .from('unit_progress')
        .select('unit_id, status, completed_at')
        .eq('user_id', user.id)
        .eq('path_id', path.id),
      supabase
        .from('quiz_attempts')
        .select('unit_id, attempt_number, answers, score, submitted_at')
        .eq('user_id', user.id)
        .eq('path_id', path.id)
        .order('attempt_number', { ascending: true }),
      supabase
        .from('build_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('path_id', path.id),
      supabase
        .from('practice_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('path_id', path.id),
    ]);

  for (const unit of units ?? []) {
    if (unit.status === 'completed') {
      state.completedUnitIds.push(unit.unit_id);
      if (unit.completed_at) {
        state.completionDates[unit.unit_id] = unit.completed_at.slice(0, 10);
      }
    }
  }

  const attemptsByUnit = new Map<string, NonNullable<typeof attempts>>();
  for (const attempt of attempts ?? []) {
    const list = attemptsByUnit.get(attempt.unit_id) ?? [];
    list.push(attempt);
    attemptsByUnit.set(attempt.unit_id, list);
  }
  for (const [unitId, list] of attemptsByUnit) {
    const latest = list[list.length - 1];
    state.quizResults[unitId] = {
      answers: latest.answers,
      score: latest.score,
      attempts: list.length,
      completedAt: latest.submitted_at,
    };
  }

  for (const build of builds ?? []) {
    state.builds[build.unit_id] = {
      tool: build.tool as 'chatgpt' | 'claude',
      checkedSteps: build.checked_steps ?? [],
      checkedCriteria: build.checked_criteria ?? [],
      ranWorkflow: build.ran_workflow,
    };
  }

  for (const practice of practices ?? []) {
    const reflections: Record<number, string> = {};
    const raw = (practice.reflections ?? {}) as Record<string, string>;
    for (const [key, value] of Object.entries(raw)) reflections[Number(key)] = value;
    state.practices[practice.unit_id] = {
      checkedRules: practice.checked_rules ?? [],
      reflections,
      revealedHints: practice.revealed_hints,
    };
  }

  return state;
}

// ---------------------------------------------------------------------------
// saveAssessment
// ---------------------------------------------------------------------------

const assessmentSchema = z.object({
  beyondDrafting: z.boolean(),
  context: z.enum(['feedback', 'requests', 'communication', 'prototyping']),
  builtWorkflow: z.boolean(),
});

export async function saveAssessment(input: unknown): Promise<ActionResult> {
  const parsed = assessmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const answers: AssessmentAnswers = parsed.data;
  const path = derivePath(answers);

  const { error } = await supabase.rpc('submit_assessment', {
    p_beyond_drafting: answers.beyondDrafting,
    p_work_context: answers.context,
    p_built_workflow: answers.builtWorkflow,
    p_entry_level: path.entryLevel,
    p_guidance_level: path.guidanceLevel,
    p_module_ids: path.assignedModuleIds,
  });
  if (error) {
    console.error('submit_assessment failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  return { ok: true, state: await loadSnapshot() };
}

// ---------------------------------------------------------------------------
// submitQuiz — server derives the correct answers and score; never trusts a
// client-provided score.
// ---------------------------------------------------------------------------

const submitQuizSchema = z.object({
  unitId: z.string().min(1),
  answers: z.array(z.number().int().min(0)).min(1),
});

export async function submitQuiz(input: unknown): Promise<ActionResult> {
  const parsed = submitQuizSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { data: activePath } = await supabase
    .from('learning_paths')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!activePath) return { ok: false, error: 'no_active_path' };

  const unit = curriculum
    .flatMap((module) => module.units)
    .find((candidate) => candidate.id === parsed.data.unitId);
  if (!unit || unit.kind !== 'lesson') return { ok: false, error: 'invalid_input' };
  if (parsed.data.answers.length !== unit.quiz.length) {
    return { ok: false, error: 'invalid_input' };
  }

  const score = parsed.data.answers.reduce(
    (sum, answer, index) =>
      sum + (answer === unit.quiz[index].correctIndex ? 1 : 0),
    0,
  );

  const { error } = await supabase.rpc('submit_quiz_attempt', {
    p_path_id: activePath.id,
    p_unit_id: unit.id,
    p_answers: parsed.data.answers,
    p_score: score,
  });
  if (error) {
    console.error('submit_quiz_attempt failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  return { ok: true, state: await loadSnapshot() };
}

// ---------------------------------------------------------------------------
// saveBuild / savePractice — frequent, low-stakes progress writes (checkbox
// toggles). Upserted directly under RLS; no RPC needed since a partial
// failure here just means the next toggle retries, not a corrupted invariant.
// ---------------------------------------------------------------------------

const buildInputSchema = z.object({
  unitId: z.string().min(1),
  progress: z.object({
    tool: z.enum(['chatgpt', 'claude']),
    checkedSteps: z.array(z.number().int().min(0)),
    checkedCriteria: z.array(z.number().int().min(0)),
    ranWorkflow: z.boolean(),
  }),
  complete: z.boolean(),
});

export async function saveBuild(input: unknown): Promise<ActionResult> {
  const parsed = buildInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { data: activePath } = await supabase
    .from('learning_paths')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!activePath) return { ok: false, error: 'no_active_path' };

  const unit = curriculum
    .flatMap((module) => module.units)
    .find((candidate) => candidate.id === parsed.data.unitId);
  if (!unit || unit.kind !== 'build') return { ok: false, error: 'invalid_input' };

  const progress: BuildProgress = parsed.data.progress;
  if (
    progress.checkedSteps.some((index) => index >= unit.steps.length) ||
    progress.checkedCriteria.some((index) => index >= unit.checks.length)
  ) {
    return { ok: false, error: 'invalid_input' };
  }

  const { error } = await supabase.from('build_progress').upsert({
    user_id: user.id,
    path_id: activePath.id,
    unit_id: unit.id,
    tool: progress.tool,
    checked_steps: progress.checkedSteps,
    checked_criteria: progress.checkedCriteria,
    ran_workflow: progress.ranWorkflow,
    completed_at: parsed.data.complete ? new Date().toISOString() : null,
  });
  if (error) {
    console.error('build_progress upsert failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  if (parsed.data.complete) {
    const complete =
      progress.checkedSteps.length === unit.steps.length &&
      progress.checkedCriteria.length === unit.checks.length &&
      progress.ranWorkflow;
    if (!complete) return { ok: false, error: 'invalid_input' };
    const { error: unitError } = await supabase.from('unit_progress').upsert({
      user_id: user.id,
      path_id: activePath.id,
      unit_id: unit.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
    if (unitError) {
      console.error('unit_progress upsert failed', { code: unitError.code });
      return { ok: false, error: 'unavailable' };
    }
  }

  return { ok: true, state: await loadSnapshot() };
}

const practiceInputSchema = z.object({
  unitId: z.string().min(1),
  progress: z.object({
    checkedRules: z.array(z.number().int().min(0)),
    reflections: z.record(z.string(), z.string().max(400)),
    revealedHints: z.number().int().min(0),
  }),
  complete: z.boolean(),
});

export async function savePractice(input: unknown): Promise<ActionResult> {
  const parsed = practiceInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { data: activePath } = await supabase
    .from('learning_paths')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!activePath) return { ok: false, error: 'no_active_path' };

  const unit = curriculum
    .flatMap((module) => module.units)
    .find((candidate) => candidate.id === parsed.data.unitId);
  if (!unit || unit.kind !== 'practice') return { ok: false, error: 'invalid_input' };

  const progress: PracticeProgress = parsed.data.progress;
  if (
    progress.checkedRules.some((index) => index >= unit.rules.length) ||
    progress.revealedHints > unit.hints.length
  ) {
    return { ok: false, error: 'invalid_input' };
  }

  const { error } = await supabase.from('practice_progress').upsert({
    user_id: user.id,
    path_id: activePath.id,
    unit_id: unit.id,
    checked_rules: progress.checkedRules,
    reflections: progress.reflections,
    revealed_hints: progress.revealedHints,
    completed_at: parsed.data.complete ? new Date().toISOString() : null,
  });
  if (error) {
    console.error('practice_progress upsert failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  if (parsed.data.complete) {
    const hasReflection = Object.values(progress.reflections).some(
      (value) => value.trim().length > 0,
    );
    const complete = progress.checkedRules.length === unit.rules.length && hasReflection;
    if (!complete) return { ok: false, error: 'invalid_input' };
    const { error: unitError } = await supabase.from('unit_progress').upsert({
      user_id: user.id,
      path_id: activePath.id,
      unit_id: unit.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
    if (unitError) {
      console.error('unit_progress upsert failed', { code: unitError.code });
      return { ok: false, error: 'unavailable' };
    }
  }

  return { ok: true, state: await loadSnapshot() };
}

// ---------------------------------------------------------------------------
// saveAvatar
// ---------------------------------------------------------------------------

const avatarSchema = z.object({ seed: z.string().min(1).max(200) });

export async function saveAvatar(input: unknown): Promise<ActionResult> {
  const parsed = avatarSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_seed: parsed.data.seed })
    .eq('user_id', user.id);
  if (error) {
    console.error('avatar_seed update failed', { code: error.code });
    return { ok: false, error: 'unavailable' };
  }

  return { ok: true, state: await loadSnapshot() };
}

'use server';
import { createClient } from '@/lib/supabase/server';
import { curriculum } from '@/content/modules';
import { derivePath } from './assessment';
import { learningStateSchema } from './validation';
import { loadSnapshot, type ActionResult } from './server-actions';

// One-time import of legacy browser-only progress into the account.
// See docs/SUPABASE_IMPLEMENTATION_PLAN.md section 9 for the full flow this
// implements: validate -> recalculate on the server -> merge by stable unit
// ID -> server wins on conflict -> mark consumed -> caller clears
// localStorage only after this returns ok.
export async function importLocalState(raw: unknown): Promise<
  ActionResult | { ok: true; state: import('./types').LearningState; alreadyImported: true }
> {
  const parsed = learningStateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  const local = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  // Idempotency: a fixed key per user is enough here since this whole
  // action is a one-time, all-or-nothing operation per account, not a
  // per-request retry token.
  const { data: recorded, error: recordError } = await supabase.rpc(
    'record_local_state_import',
    { p_idempotency_key: `local-import-${user.id}` },
  );
  if (recordError) {
    console.error('record_local_state_import failed', { code: recordError.code });
    return { ok: false, error: 'unavailable' };
  }
  if (!recorded) {
    // Already imported previously — idempotent no-op, not an error.
    return { ok: true, state: await loadSnapshot(), alreadyImported: true };
  }

  const { data: existingPath } = await supabase
    .from('learning_paths')
    .select('id, learning_path_modules(module_id)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  let pathId = existingPath?.id;
  let assignedModuleIds = (existingPath?.learning_path_modules ?? []).map(
    (module) => module.module_id,
  );

  // Only create a path from local data if the account has none yet. If the
  // server already has an active path, it wins outright — we still try to
  // merge unit-level progress below, but never overwrite the server's path.
  if (!pathId && local.assessment) {
    const derived = derivePath(local.assessment);
    const { data: newPathId, error: submitError } = await supabase.rpc(
      'submit_assessment',
      {
        p_beyond_drafting: local.assessment.beyondDrafting,
        p_work_context: local.assessment.context,
        p_built_workflow: local.assessment.builtWorkflow,
        p_entry_level: derived.entryLevel,
        p_guidance_level: derived.guidanceLevel,
        p_module_ids: derived.assignedModuleIds,
      },
    );
    if (submitError) {
      console.error('submit_assessment (import) failed', { code: submitError.code });
      return { ok: false, error: 'unavailable' };
    }
    pathId = newPathId ?? undefined;
    assignedModuleIds = derived.assignedModuleIds;
  }

  if (!pathId) {
    // No server path and no local assessment to derive one from — nothing
    // unit-level can be merged. The import is still marked consumed above
    // since there was nothing else valid to bring in.
    return { ok: true, state: await loadSnapshot() };
  }

  const assignedUnitIds = new Set(
    curriculum
      .filter((module) => assignedModuleIds.includes(module.id))
      .flatMap((module) => module.units)
      .map((unit) => unit.id),
  );
  const unitById = new Map(
    curriculum.flatMap((module) => module.units).map((unit) => [unit.id, unit]),
  );

  for (const [unitId, result] of Object.entries(local.quizResults)) {
    if (!assignedUnitIds.has(unitId)) continue;
    const unit = unitById.get(unitId);
    if (!unit || unit.kind !== 'lesson') continue;
    if (result.answers.length !== unit.quiz.length) continue;
    const score = result.answers.reduce(
      (sum, answer, index) =>
        sum + (answer === unit.quiz[index].correctIndex ? 1 : 0),
      0,
    );
    await supabase.rpc('submit_quiz_attempt', {
      p_path_id: pathId,
      p_unit_id: unitId,
      p_answers: result.answers,
      p_score: score,
    });
  }

  for (const [unitId, build] of Object.entries(local.builds)) {
    if (!assignedUnitIds.has(unitId)) continue;
    const unit = unitById.get(unitId);
    if (!unit || unit.kind !== 'build') continue;
    const checkedSteps = build.checkedSteps.filter((i) => i < unit.steps.length);
    const checkedCriteria = build.checkedCriteria.filter(
      (i) => i < unit.checks.length,
    );
    await supabase.from('build_progress').upsert({
      user_id: user.id,
      path_id: pathId,
      unit_id: unitId,
      tool: build.tool,
      checked_steps: checkedSteps,
      checked_criteria: checkedCriteria,
      ran_workflow: build.ranWorkflow,
      completed_at: local.completedUnitIds.includes(unitId)
        ? new Date().toISOString()
        : null,
    });
  }

  for (const [unitId, practice] of Object.entries(local.practices)) {
    if (!assignedUnitIds.has(unitId)) continue;
    const unit = unitById.get(unitId);
    if (!unit || unit.kind !== 'practice') continue;
    const checkedRules = practice.checkedRules.filter((i) => i < unit.rules.length);
    await supabase.from('practice_progress').upsert({
      user_id: user.id,
      path_id: pathId,
      unit_id: unitId,
      checked_rules: checkedRules,
      reflections: practice.reflections,
      revealed_hints: Math.min(practice.revealedHints, unit.hints.length),
      completed_at: local.completedUnitIds.includes(unitId)
        ? new Date().toISOString()
        : null,
    });
  }

  // Any remaining completed unit IDs not already covered by a quiz/build/
  // practice write above (defensive — normally every completed unit has a
  // matching entry in one of those maps).
  for (const unitId of local.completedUnitIds) {
    if (!assignedUnitIds.has(unitId)) continue;
    await supabase.from('unit_progress').upsert(
      {
        user_id: user.id,
        path_id: pathId,
        unit_id: unitId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,path_id,unit_id', ignoreDuplicates: true },
    );
  }

  return { ok: true, state: await loadSnapshot() };
}

'use client';
import Link from 'next/link';
import { useLearning } from '@/app/providers';
import { completeUnit, isUnitUnlocked } from '@/lib/learning/progression';
import { track } from '@/lib/learning/analytics';
import type {
  CurriculumModule,
  PracticeProgress,
  PracticeUnit,
} from '@/lib/learning/types';
const emptyProgress: PracticeProgress = {
  checkedRules: [],
  reflections: {},
  revealedHints: 0,
};
const toggle = (items: number[], index: number) =>
  items.includes(index)
    ? items.filter((item) => item !== index)
    : [...items, index];
export function PracticeView({
  courseModule,
  unit,
}: {
  courseModule: CurriculumModule;
  unit: PracticeUnit;
}) {
  const { state, ready, update } = useLearning();
  const progress = state.practices[unit.id] ?? emptyProgress;
  if (!ready) return <div className="state-message">Loading Practice…</div>;
  if (
    !isUnitUnlocked(state, unit.id) &&
    !state.completedUnitIds.includes(unit.id)
  )
    return (
      <div className="state-message">
        <h1>Practice is still locked.</h1>
        <p className="muted">Complete Saturday’s Build first.</p>
        <Link className="btn" href={`/app/modules/${courseModule.slug}`}>
          Back to module
        </Link>
      </div>
    );
  const patchProgress = (next: Partial<PracticeProgress>) =>
    update((current) => ({
      ...current,
      practices: {
        ...current.practices,
        [unit.id]: {
          ...(current.practices[unit.id] ?? emptyProgress),
          ...next,
        },
      },
    }));
  const hasReflection = Object.values(progress.reflections).some(
    (value) => value.trim().length > 0,
  );
  const canComplete =
    progress.checkedRules.length === unit.rules.length && hasReflection;
  const finish = () => {
    if (!canComplete) return;
    update((current) => completeUnit(current, unit.id));
    track('practice_completed', { moduleId: courseModule.id, unitId: unit.id });
  };
  return (
    <article className="learning-page practice-page">
      <Link className="text-back" href={`/app/modules/${courseModule.slug}`}>
        ← {courseModule.title}
      </Link>
      <header className="practice-head">
        <span>SUNDAY PRACTICE · 15 MIN</span>
        <h1>{unit.title}</h1>
        <p>{unit.challenge}</p>
      </header>
      <div className="independent-note">
        <b>Make it your own</b>
        <p>
          Change at least one input, rule, output field or test case. Using a
          hint is completely acceptable; copying Saturday’s prompt unchanged is
          not independent practice.
        </p>
      </div>
      <section className="practice-rules">
        <h2>Challenge rules</h2>
        {unit.rules.map((rule, index) => (
          <label key={rule}>
            <input
              type="checkbox"
              checked={progress.checkedRules.includes(index)}
              onChange={() =>
                patchProgress({
                  checkedRules: toggle(progress.checkedRules, index),
                })
              }
            />
            <span>{rule}</span>
          </label>
        ))}
      </section>
      <section className="hint-panel">
        <h2>Need a nudge?</h2>
        {unit.hints.slice(0, progress.revealedHints).map((hint, index) => (
          <p key={hint}>
            <b>Hint {index + 1}:</b> {hint}
          </p>
        ))}
        {progress.revealedHints < unit.hints.length && (
          <button
            className="btn ghost"
            onClick={() =>
              patchProgress({ revealedHints: progress.revealedHints + 1 })
            }
          >
            Show one hint
          </button>
        )}
      </section>
      <section className="reflections">
        <h2>Reflect</h2>
        <p className="muted">
          Write at least one short response. Your answers stay in this browser.
        </p>
        {unit.reflections.map((reflection, index) => (
          <label key={reflection}>
            <span>{reflection}</span>
            <textarea
              maxLength={400}
              value={progress.reflections[index] ?? ''}
              onChange={(event) =>
                patchProgress({
                  reflections: {
                    ...progress.reflections,
                    [index]: event.target.value,
                  },
                })
              }
              placeholder="Your reflection"
            />
          </label>
        ))}
      </section>
      <button
        className="btn"
        disabled={!canComplete || state.completedUnitIds.includes(unit.id)}
        onClick={finish}
      >
        {state.completedUnitIds.includes(unit.id)
          ? 'Practice complete'
          : 'Complete Practice →'}
      </button>
    </article>
  );
}

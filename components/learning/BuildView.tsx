'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLearning } from '@/app/providers';
import { isUnitUnlocked } from '@/lib/learning/progression';
import { saveBuild } from '@/lib/learning/server-actions';
import { track } from '@/lib/learning/analytics';
import type {
  BuildProgress,
  BuildUnit,
  CurriculumModule,
} from '@/lib/learning/types';

const emptyProgress: BuildProgress = {
  tool: 'chatgpt',
  checkedSteps: [],
  checkedCriteria: [],
  ranWorkflow: false,
};
const toggle = (items: number[], index: number) =>
  items.includes(index)
    ? items.filter((item) => item !== index)
    : [...items, index];
export function BuildView({
  courseModule,
  unit,
}: {
  courseModule: CurriculumModule;
  unit: BuildUnit;
}) {
  const router = useRouter();
  const { state, ready, setState } = useLearning();
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState<BuildProgress>(
    () => state.builds[unit.id] ?? emptyProgress,
  );
  const [finishing, setFinishing] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  if (!ready) return <div className="state-message">Loading Build…</div>;
  if (
    !isUnitUnlocked(state, unit.id) &&
    !state.completedUnitIds.includes(unit.id)
  )
    return (
      <div className="state-message">
        <h1>Build is still locked.</h1>
        <p className="muted">Submit all five weekday checks first.</p>
        <Link className="btn" href={`/app/modules/${courseModule.slug}`}>
          Back to module
        </Link>
      </div>
    );
  const patchProgress = (next: Partial<BuildProgress>) => {
    const updated = { ...progress, ...next };
    setProgress(updated);
    // Fire-and-forget: instant local UI, background sync. A failed toggle
    // save just means the next toggle (or Complete) retries with the
    // latest local state, since this upsert is idempotent per unit.
    saveBuild({ unitId: unit.id, progress: updated, complete: false }).catch(
      () => {},
    );
  };
  const canComplete =
    progress.checkedSteps.length === unit.steps.length &&
    progress.checkedCriteria.length === unit.checks.length &&
    progress.ranWorkflow;
  const finish = async () => {
    if (!canComplete || finishing) return;
    setFinishing(true);
    setSaveFailed(false);
    // A dropped connection rejects rather than returning ok: false.
    const result = await saveBuild({
      unitId: unit.id,
      progress,
      complete: true,
    }).catch(() => null);
    setFinishing(false);
    if (!result?.ok) {
      setSaveFailed(true);
      return;
    }
    setState(result.state);
    track('build_completed', {
      moduleId: courseModule.id,
      unitId: unit.id,
      tool: progress.tool,
    });
    // Build is always second-to-last in a module, right before Practice
    // (Day 7) — send the learner straight on rather than leaving them
    // stranded on the now-disabled Build screen.
    const nextIndex =
      courseModule.units.findIndex((item) => item.id === unit.id) + 1;
    const nextUnit = courseModule.units[nextIndex];
    if (nextUnit)
      router.push(`/app/modules/${courseModule.slug}/${nextUnit.day}`);
  };
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(unit.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <article className="learning-page build-page">
      <Link className="text-back" href={`/app/modules/${courseModule.slug}`}>
        ← {courseModule.title}
      </Link>
      <header className="build-head">
        <span>SATURDAY BUILD · {unit.estimate}</span>
        <h1>{unit.title}</h1>
        <p>{unit.outcome}</p>
      </header>
      <div className="privacy-note">
        <b>Protect workplace data</b>
        <p>
          Use only mock or anonymised material, and follow your organisation’s
          policy before sharing anything with an external AI tool.
        </p>
      </div>
      <section className="tool-choice">
        <h2>Choose your tool</h2>
        <div>
          <button
            className={progress.tool === 'chatgpt' ? 'selected' : ''}
            onClick={() => patchProgress({ tool: 'chatgpt' })}
          >
            ChatGPT
          </button>
          <button
            className={progress.tool === 'claude' ? 'selected' : ''}
            onClick={() => patchProgress({ tool: 'claude' })}
          >
            Claude
          </button>
        </div>
      </section>
      <details
        className="practice-input"
        open={state.path?.guidanceLevel === 'full'}
      >
        <summary>View practice input</summary>
        <pre>{unit.practiceInput}</pre>
      </details>
      <section className="build-steps">
        <h2>Build the workflow</h2>
        {unit.steps.map((step, index) => (
          <label key={step}>
            <input
              type="checkbox"
              checked={progress.checkedSteps.includes(index)}
              onChange={() =>
                patchProgress({
                  checkedSteps: toggle(progress.checkedSteps, index),
                })
              }
            />
            <span>{step}</span>
          </label>
        ))}
      </section>
      <section className="prompt-block">
        <div>
          <h2>Prompt to use</h2>
          <button onClick={copyPrompt}>
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <pre>{unit.prompt}</pre>
        <p role="status" aria-live="polite">
          {copied ? 'Prompt copied to your clipboard.' : ''}
        </p>
      </section>
      <div className="external-tools">
        <a href="https://chatgpt.com" target="_blank" rel="noreferrer">
          Open ChatGPT ↗
        </a>
        <a href="https://claude.ai" target="_blank" rel="noreferrer">
          Open Claude ↗
        </a>
      </div>
      <section className="completion-check">
        <h2>Check your result</h2>
        {unit.checks.map((check, index) => (
          <label key={check}>
            <input
              type="checkbox"
              checked={progress.checkedCriteria.includes(index)}
              onChange={() =>
                patchProgress({
                  checkedCriteria: toggle(progress.checkedCriteria, index),
                })
              }
            />
            <span>{check}</span>
          </label>
        ))}
        <label className="ran-check">
          <input
            type="checkbox"
            checked={progress.ranWorkflow}
            onChange={(event) =>
              patchProgress({ ranWorkflow: event.target.checked })
            }
          />
          <span>I ran the workflow and checked the result.</span>
        </label>
        {saveFailed && (
          <p role="alert" className="save-error">
            Couldn’t save your progress. Check your connection and try again.
          </p>
        )}
        <button
          className="btn"
          disabled={
            !canComplete ||
            finishing ||
            state.completedUnitIds.includes(unit.id)
          }
          onClick={finish}
        >
          {state.completedUnitIds.includes(unit.id)
            ? 'Build complete'
            : finishing
              ? 'Saving…'
              : 'Complete Build →'}
        </button>
      </section>
    </article>
  );
}

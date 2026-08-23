'use client';
import Link from 'next/link';
import { useLearning } from '@/app/providers';
import {
  assignedModulePosition,
  nextAssignedModule,
} from '@/lib/learning/progression';
import type { CurriculumModule, PracticeUnit } from '@/lib/learning/types';

// Shown right after Practice (Day 7) completes — one module just finished.
// Reuses the same sixa-result card layout as QuizResult for visual
// consistency across every completion screen in the app.
export function PracticeResult({
  module,
  unit,
}: {
  module: CurriculumModule;
  unit: PracticeUnit;
}) {
  const { state, ready } = useLearning();
  if (!ready) return <div className="state-message">Loading result…</div>;
  if (!state.completedUnitIds.includes(unit.id))
    return (
      <div className="state-message">
        <h1>No result yet.</h1>
        <Link className="btn" href={`/app/modules/${module.slug}/${unit.day}`}>
          Finish Practice
        </Link>
      </div>
    );
  const position = assignedModulePosition(state, module.id);
  // Position, not raw module id — paths are personalized, so "Module 2"
  // here means "the next module in this learner's order", which may not
  // be curriculum module id 2.
  const next = nextAssignedModule(state, module.id);

  return (
    <article className="sixa-result sixa-module-complete">
      <div className="sixa-result-main">
        {/* eslint-disable-next-line @next/next/no-img-element -- static
            SVG illustration; next/image can't optimize local SVGs without
            enabling dangerouslyAllowSVG, which isn't worth it for a vector. */}
        <img
          className="sixa-congrats-icon"
          src="/images/congratulations.svg"
          alt=""
          aria-hidden
        />
        <strong className="sixa-congrats-title">Congratulations!</strong>
        <p className="sixa-congrats-subtitle">
          You&rsquo;ve completed Module {position}.
        </p>
        {next && <p>Ready to move on to Module {position + 1}?</p>}
      </div>
      <footer>
        {next && (
          <Link
            className="sixa-primary-action"
            href={`/app/modules/${next.slug}/${next.units[0].day}`}
          >
            Continue to Module {position + 1}
          </Link>
        )}
        <Link href="/app">Take me Home</Link>
      </footer>
    </article>
  );
}

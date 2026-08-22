'use client';

import Link from 'next/link';
import { useLearning } from '@/app/providers';
import { assignedUnits, learningStreak } from '@/lib/learning/progression';
import type { CurriculumModule, LessonUnit } from '@/lib/learning/types';

export function QuizResult({
  module,
  unit,
}: {
  module: CurriculumModule;
  unit: LessonUnit;
}) {
  const { state, ready } = useLearning();
  if (!ready) return <div className="state-message">Loading result…</div>;
  const result = state.quizResults[unit.id];
  if (!result)
    return (
      <div className="state-message">
        <h1>No result yet.</h1>
        <Link className="btn" href={`/app/modules/${module.slug}/${unit.day}`}>
          Take the check
        </Link>
      </div>
    );
  const units = assignedUnits(state);
  const index = units.findIndex((item) => item.id === unit.id);
  const moduleUnitIndex = module.units.findIndex((item) => item.id === unit.id);
  const next = units[index + 1];
  const nextHref = next
    ? `/app/modules/module-${next.id.split('-')[1]}/${next.day}`
    : '/app';
  const circumference = 276;
  const scoreOffset =
    circumference - (result.score / unit.quiz.length) * circumference;
  const blurb =
    result.score === unit.quiz.length
      ? 'Clean sweep. Your next lesson is unlocked.'
      : result.score >= 2
        ? 'Close. Re-read anything that felt uncertain, then move on.'
        : 'Worth another pass — the lesson only takes 10 minutes.';
  const nextLabel = !next
    ? 'Back to home'
    : next.id.startsWith(`module-${module.id}-`)
      ? `Continue to Day ${moduleUnitIndex + 2}`
      : 'Continue to next module';

  return (
    <article className="sixa-result">
      <div className="sixa-result-glow" />
      <div className="sixa-result-main">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="44" className="track" />
          <circle
            cx="60"
            cy="60"
            r="44"
            className="score"
            strokeDasharray={circumference}
            strokeDashoffset={scoreOffset}
          />
          <path d="m46 60 10 10 20-22" />
        </svg>
        <strong>
          {result.score} / {unit.quiz.length}
        </strong>
        <p>{blurb}</p>
        <div>
          <span>Day {moduleUnitIndex + 1} complete</span>
          <span>Streak {learningStreak(state)}</span>
        </div>
      </div>
      <footer>
        <Link className="sixa-primary-action" href={nextHref}>
          {nextLabel}
          <span aria-hidden="true">→</span>
        </Link>
        <Link href={`/app/modules/${module.slug}/${unit.day}`}>
          Re-read the lesson
        </Link>
      </footer>
    </article>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLearning } from '@/app/providers';
import { assignedUnits, learningStreak } from '@/lib/learning/progression';
import { FeedbackForm } from './FeedbackForm';
import type { CurriculumModule, LessonUnit } from '@/lib/learning/types';

// One-time-per-unit local marker so a page refresh doesn't re-prompt after
// the learner already dismissed or submitted it. Not server-verified — this
// is an early-insight signal (PRD 11.1), not the North Star, so an
// occasional re-prompt on a new device is an acceptable gap, not a bug.
const feedbackShownKey = (unitId: string) => `marg-feedback-shown-${unitId}`;

export function QuizResult({
  module,
  unit,
}: {
  module: CurriculumModule;
  unit: LessonUnit;
}) {
  const { state, ready } = useLearning();
  const [showFeedback, setShowFeedback] = useState(false);
  const result = state.quizResults[unit.id];
  const moduleUnitIndex = module.units.findIndex((item) => item.id === unit.id);
  // Day 1 and Day 2 result screens only — see PRD 11.1's product dependency
  // note. Not gated to the first module: it's an early-insight signal about
  // the lesson experience itself, not tied to module completion.
  const isFeedbackDay = moduleUnitIndex === 0 || moduleUnitIndex === 1;

  useEffect(() => {
    if (!ready || !result || !isFeedbackDay) return;
    if (window.localStorage.getItem(feedbackShownKey(unit.id))) return;
    const timer = window.setTimeout(() => setShowFeedback(true), 0);
    return () => window.clearTimeout(timer);
  }, [ready, result, isFeedbackDay, unit.id]);

  const closeFeedback = () => {
    window.localStorage.setItem(feedbackShownKey(unit.id), '1');
    setShowFeedback(false);
  };

  if (!ready) return <div className="state-message">Loading result…</div>;
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
        : `You answered ${result.score} of ${unit.quiz.length} questions correct. A quick re-read will help it stick.`;
  const nextLabel = !next
    ? 'Back to home'
    : next.id.startsWith(`module-${module.id}-`)
      ? `Continue to Day ${moduleUnitIndex + 2}`
      : 'Continue to next module';

  return (
    <article className="sixa-result">
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
          <span className="sixa-result-day-complete">
            Day {moduleUnitIndex + 1} complete
          </span>
          <span>Streak {learningStreak(state)}</span>
        </div>
      </div>
      <footer>
        <Link className="sixa-primary-action" href={nextHref}>
          {nextLabel}
        </Link>
        <Link href={`/app/modules/${module.slug}/${unit.day}`}>
          Re-read the lesson
        </Link>
      </footer>
      {showFeedback && (
        <FeedbackForm
          onClose={closeFeedback}
          moduleId={module.id}
          unitId={unit.id}
        />
      )}
    </article>
  );
}

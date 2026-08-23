'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLearning } from '@/app/providers';
import { assignedModules } from '@/lib/learning/progression';
import { FeedbackForm } from './FeedbackForm';

// One-time local marker so a page refresh doesn't re-prompt after the
// learner already dismissed or submitted it — same pattern as QuizResult's
// per-unit feedback prompt.
const feedbackShownKey = 'marg-feedback-shown-course-complete';

// Shown once every assigned module is complete — the end of the learner's
// whole path. Reuses the same sixa-result card as QuizResult/PracticeResult,
// and the same feedback sheet as everywhere else, with copy swapped to ask
// what the learner wants to learn next.
export function CourseCompleteView() {
  const { state, ready } = useLearning();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (window.localStorage.getItem(feedbackShownKey)) return;
    const timer = window.setTimeout(() => setShowFeedback(true), 0);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const closeFeedback = () => {
    window.localStorage.setItem(feedbackShownKey, '1');
    setShowFeedback(false);
  };

  if (!ready) return <div className="state-message">Loading…</div>;
  const modules = assignedModules(state);
  const lastModuleId = modules[modules.length - 1]?.id;

  return (
    <article className="sixa-result sixa-course-complete">
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
          You&rsquo;ve completed every module in your path.
        </p>
      </div>
      <footer>
        <Link className="sixa-primary-action" href="/app">
          Take me Home
        </Link>
      </footer>
      {showFeedback && (
        <FeedbackForm
          onClose={closeFeedback}
          moduleId={lastModuleId}
          title="Rate your path"
          subtitle="What do you want to learn next?"
          placeholder="What do you want to learn next?"
        />
      )}
    </article>
  );
}

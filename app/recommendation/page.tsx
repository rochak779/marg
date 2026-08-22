'use client';
import { useRouter } from 'next/navigation';
import { useLearning } from '@/app/providers';
import { Arrow, Brand, Stage } from '@/components/ui';
import { moduleById } from '@/content/modules';
import { recommendationExplanation } from '@/lib/learning/assessment';
import { track } from '@/lib/learning/analytics';

export default function Recommendation() {
  const router = useRouter();
  const { state, ready } = useLearning();
  if (!ready)
    return (
      <Stage>
        <div className="state-message" role="status">
          Loading your path…
        </div>
      </Stage>
    );
  if (!state.path || !state.assessment)
    return (
      <Stage>
        <div className="state-message">
          <Brand />
          <h1>Let’s find your starting point.</h1>
          <p className="muted">
            Complete three short questions to create your path.
          </p>
          <button className="btn" onClick={() => router.push('/assessment')}>
            Start assessment <Arrow />
          </button>
        </div>
      </Stage>
    );
  const modules = state.path.assignedModuleIds.map(moduleById).filter(Boolean);
  const first = modules[0]!;
  const retake = () => {
    if (
      !window.confirm(
        'Retaking changes your assigned module order. Completed units will remain saved wherever they still apply. Continue?',
      )
    )
      return;
    // No client state to clear: submitting the assessment again supersedes
    // the current path server-side (see submit_assessment in the DB).
    track('assessment_retaken');
    router.push('/assessment');
  };
  return (
    <Stage>
      <div className="top">
        <span />
        <Brand />
        <span style={{ width: 36 }} />
      </div>
      <div className="result recommendation">
        <h1>Your path is set.</h1>
        <p className="muted">{recommendationExplanation(state.assessment)}</p>
        <div className="result-card">
          <span className="pill">
            {state.path.entryLevel === 'basic'
              ? 'BASIC FOUNDATIONS'
              : 'ADVANCED APPLIED PATH'}
          </span>
          <h2>{first.title}</h2>
          <p>{first.outcome}</p>
        </div>
        <div className="path-list">
          <b>Your learning path</b>
          {modules.map((module, index) => (
            <div key={module!.id}>
              <span>{index + 1}</span>
              <p>{module!.title}</p>
            </div>
          ))}
        </div>
        <div className="guidance-note">
          <b>Build guidance</b>
          <p>
            {state.path.guidanceLevel === 'full'
              ? 'Expanded explanations, open hints and detailed checklists will guide your Saturday Builds.'
              : 'Hints stay available but collapsed, so you can work more independently.'}
          </p>
        </div>
      </div>
      <div className="bottom-actions">
        <button
          className="btn"
          onClick={() => router.push(`/app/modules/${first.slug}/monday`)}
        >
          Start first lesson <Arrow />
        </button>
        <button className="nav-btn" onClick={retake}>
          Retake assessment
        </button>
      </div>
    </Stage>
  );
}

'use client';
import Link from 'next/link';
import { useLearning } from '@/app/providers';
import { DashboardHeader } from '@/components/learning/DashboardHeader';
import { moduleById, shortModuleTitle } from '@/content/modules';
import {
  assignedModules,
  moduleProgress,
  nextUnit,
  progressSummary,
  learningStreak,
} from '@/lib/learning/progression';
export default function HomePage() {
  const { state, ready } = useLearning();
  if (!ready) return <div className="state-message">Loading your path…</div>;
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Your practical AI path starts here.</h1>
        <p className="muted">
          Answer three questions to choose the right starting module.
        </p>
        <Link className="btn" href="/assessment">
          Create my path
        </Link>
      </div>
    );
  const summary = progressSummary(state);
  const unit = nextUnit(state);
  const moduleId = unit
    ? Number(unit.id.split('-')[1])
    : state.path.assignedModuleIds.at(-1)!;
  const currentModule = moduleById(moduleId)!;
  const href = unit
    ? `/app/modules/${currentModule.slug}/${unit.day}`
    : '/app/progress';
  const modules = assignedModules(state);
  const currentPosition = Math.max(
    0,
    modules.findIndex((item) => item.id === currentModule.id),
  );
  const completedLessons = Object.keys(state.quizResults).length;
  const dayNumber = unit
    ? currentModule.units.findIndex((item) => item.id === unit.id) + 1
    : currentModule.units.length;
  return (
    <div className="home-view">
      <DashboardHeader
        subtitle={`Module ${currentPosition + 1} of ${modules.length}`}
        progress={summary.percentage}
        firstName={state.profile?.firstName}
        streak={learningStreak(state)}
        avatarSeed={state.profile?.avatarSeed}
      />
      <div className="app-hero path-hero">
        <h1>
          {unit
            ? `${summary.total - summary.completed} lessons ahead of you`
            : 'Your path is complete'}
        </h1>
        <p>
          {unit ? (
            <>
              <b>Day {dayNumber}:</b> {shortModuleTitle(currentModule.id)}
            </>
          ) : (
            'You completed every assigned lesson.'
          )}
        </p>
        <Link className="hero-arrow" href={href}>
          {unit ? "Take me to today's lesson" : 'View progress'}
        </Link>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M7 7h10M7 12h10M7 17h6" />
            </svg>
          </span>
          <label>Lessons done</label>
          <strong>{completedLessons}</strong>
        </div>
        <div className="stat">
          <span className="stat-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7" />
              <path d="M12 8v4l3 2" />
            </svg>
          </span>
          <label>Minutes learned</label>
          <strong>{summary.minutes}</strong>
        </div>
      </div>
      <div className="panel home-progress">
        <div className="panel-title">
          <b>Progress performance</b>
          <span>
            {summary.completed}/{summary.total}
          </span>
        </div>
        <div className="linear-progress">
          <i style={{ width: `${summary.percentage}%` }} />
        </div>
        <div className="module-dots">
          {modules.map((courseModule) => {
            const progress = moduleProgress(state, courseModule);
            return (
              <Link
                key={courseModule.id}
                href={`/app/modules/${courseModule.slug}`}
                aria-label={`${courseModule.title}: ${progress.percentage}% complete`}
                className={
                  progress.completed === 7
                    ? 'done'
                    : progress.completed > 0 ||
                        courseModule.id === currentModule.id
                      ? 'current'
                      : ''
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
      />
      <div className="app-hero path-hero">
        <svg className="float path-orbit" viewBox="0 0 130 120" aria-hidden>
          <circle cx="66" cy="44" r="27" fill="#FCD197" />
          <circle
            cx="66"
            cy="44"
            r="36"
            fill="none"
            stroke="#fff"
            strokeWidth="1.2"
            opacity=".3"
            strokeDasharray="4 6"
          />
          <text
            x="66"
            y="51"
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fill="#6669B8"
          >
            AI
          </text>
          <path
            d="M66 44 26 84m40-40 44 38M26 84l84-2"
            stroke="#FCD197"
            strokeWidth="1.5"
            opacity=".55"
            fill="none"
          />
          <circle cx="26" cy="84" r="11" fill="#FDA366" />
          <circle cx="110" cy="82" r="9" fill="#F8F8F8" />
        </svg>
        <h1>
          {unit
            ? `${summary.total - summary.completed} units ahead of you`
            : 'Your path is complete'}
        </h1>
        <p>
          {unit ? (
            <>
              <b>Day {dayNumber}:</b> {shortModuleTitle(currentModule.id)}
            </>
          ) : (
            'You completed every assigned unit.'
          )}
        </p>
        <Link
          className="hero-arrow"
          href={href}
          aria-label={unit ? 'Continue' : 'View progress'}
        >
          →
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

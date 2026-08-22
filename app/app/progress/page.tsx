'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useLearning } from '@/app/providers';
import { DashboardHeader } from '@/components/learning/DashboardHeader';
import { shortModuleTitle } from '@/content/modules';
import {
  assignedModules,
  learningStreak,
  moduleProgress,
  monthlyLessonActivity,
  progressSummary,
  weeklyLessonActivity,
} from '@/lib/learning/progression';
export default function ProgressPage() {
  const { state, ready } = useLearning();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [chartSlide, setChartSlide] = useState<'activity' | 'scores'>(
    'activity',
  );
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  if (!ready) return <div className="state-message">Loading progress…</div>;
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Your progress will appear here.</h1>
        <p className="muted">Create your path and complete the first lesson.</p>
        <Link className="btn" href="/assessment">
          Create my path
        </Link>
      </div>
    );
  const summary = progressSummary(state);
  const modules = assignedModules(state);
  const weekday = state.completedUnitIds.filter(
    (id) => !id.endsWith('saturday') && !id.endsWith('sunday'),
  ).length;
  const builds = state.completedUnitIds.filter((id) =>
    id.endsWith('saturday'),
  ).length;
  const practices = state.completedUnitIds.filter((id) =>
    id.endsWith('sunday'),
  ).length;
  const activity =
    period === 'weekly'
      ? weeklyLessonActivity(state)
      : monthlyLessonActivity(state);
  const peak = Math.max(1, ...activity.map((item) => item.value));
  const safeModuleIndex = Math.min(selectedModuleIndex, modules.length - 1);
  const selectedModule = modules[safeModuleIndex];
  const lessonScores = selectedModule.units
    .filter((unit) => unit.kind === 'lesson')
    .map((unit, index) => {
      const result = state.quizResults[unit.id];
      return {
        id: unit.id,
        label: `L${index + 1}`,
        title: unit.title,
        correct: result?.score ?? 0,
        incorrect: result ? unit.quiz.length - result.score : 0,
        total: unit.quiz.length,
        complete: Boolean(result),
      };
    });
  const moduleCorrect = lessonScores.reduce(
    (total, lesson) => total + lesson.correct,
    0,
  );
  const moduleQuestions = lessonScores.reduce(
    (total, lesson) => total + lesson.total,
    0,
  );
  const changeModule = (index: number) => {
    setSelectedModuleIndex(Math.max(0, Math.min(index, modules.length - 1)));
  };
  return (
    <div className="progress-view real-progress">
      <DashboardHeader
        subtitle={`${summary.completed}/${summary.total} units`}
        progress={summary.percentage}
        firstName={state.profile?.firstName}
        streak={learningStreak(state)}
        avatarSeed={state.profile?.avatarSeed}
      />
      <div className="progress-title">
        <h1>Progress</h1>
        <span>{summary.percentage}% complete</span>
      </div>
      <div className="chart-card">
        <div
          className="progress-chart-carousel"
          onTouchStart={(event) => {
            swipeStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (swipeStart.current === null) return;
            const distance =
              event.changedTouches[0].clientX - swipeStart.current;
            if (Math.abs(distance) > 42) {
              setChartSlide(distance < 0 ? 'scores' : 'activity');
            }
            swipeStart.current = null;
          }}
        >
          {chartSlide === 'activity' ? (
            <div
              className="progress-chart-slide"
              aria-label="Learning activity chart"
            >
              <div className="chart-top">
                <span className="chart-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 18V9m6 9V5m6 13v-6" />
                  </svg>
                </span>
                <div>
                  <b>Your path</b>
                  <span>
                    {summary.completed} of {summary.total} units
                  </span>
                </div>
              </div>
              <div className="chart-totals">
                <strong>
                  {summary.completed} <i>units</i>
                </strong>
                <strong>
                  {summary.minutes} <i>minutes</i>
                </strong>
              </div>
              <div className="period-toggle" aria-label="Progress period">
                <button
                  className={period === 'weekly' ? 'active' : ''}
                  onClick={() => setPeriod('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={period === 'monthly' ? 'active' : ''}
                  onClick={() => setPeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
              {summary.completed === 0 ? (
                <div className="progress-empty">
                  Complete your first lesson to start the chart.
                </div>
              ) : (
                <div className={`module-bars activity-bars ${period}`}>
                  {activity.map((item) => (
                    <div key={item.label}>
                      <span
                        style={{
                          height: `${Math.max(8, (item.value / peak) * 100)}%`,
                        }}
                      >
                        <b>{item.value}</b>
                      </span>
                      <small>{item.label}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="progress-chart-slide">
              <div className="lesson-chart-head">
                <div>
                  <h2>Lesson scores</h2>
                  <p>Swipe or select a module</p>
                </div>
                <label className="module-select">
                  <span className="sr-only">Choose module</span>
                  <select
                    value={safeModuleIndex}
                    onChange={(event) =>
                      changeModule(Number(event.target.value))
                    }
                  >
                    {modules.map((courseModule, index) => (
                      <option key={courseModule.id} value={index}>
                        Module {index + 1}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m6 8 4 4 4-4" />
                  </svg>
                </label>
              </div>
              <div className="score-chart-summary">
                <div>
                  <strong>
                    {moduleCorrect}/{moduleQuestions}
                  </strong>
                  <span>correct answers</span>
                </div>
                <div className="score-legend" aria-label="Chart legend">
                  <span>
                    <i className="correct" />
                    Correct
                  </span>
                  <span>
                    <i className="incorrect" />
                    Incorrect
                  </span>
                  <span>
                    <i className="total" />
                    Total
                  </span>
                </div>
              </div>
              <div
                className="lesson-score-chart"
                aria-label={`Module ${safeModuleIndex + 1} lesson scores`}
              >
                <div className="score-axis" aria-hidden="true">
                  <span>3</span>
                  <span>2</span>
                  <span>1</span>
                  <span>0</span>
                </div>
                <div className="lesson-score-bars">
                  {lessonScores.map((lesson) => (
                    <div
                      className="lesson-score-column"
                      key={lesson.id}
                      aria-label={`${lesson.title}: ${lesson.complete ? `${lesson.correct} correct, ${lesson.incorrect} incorrect, ${lesson.total} total` : 'not completed'}`}
                    >
                      <span className="score-total">{lesson.total}</span>
                      <div className="score-track">
                        <i
                          className="score-incorrect"
                          style={{
                            height: `${(lesson.incorrect / lesson.total) * 100}%`,
                          }}
                        />
                        <i
                          className="score-correct"
                          style={{
                            height: `${(lesson.correct / lesson.total) * 100}%`,
                          }}
                        />
                      </div>
                      <b>{lesson.label}</b>
                      <small>
                        {lesson.complete
                          ? `${lesson.correct}/${lesson.total}`
                          : '—'}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="module-swipe-controls">
                <button
                  onClick={() => changeModule(safeModuleIndex - 1)}
                  disabled={safeModuleIndex === 0}
                  aria-label="Previous module"
                >
                  <svg viewBox="0 0 20 20">
                    <path d="m12 5-5 5 5 5" />
                  </svg>
                </button>
                <div
                  aria-label={`Module ${safeModuleIndex + 1} of ${modules.length}`}
                >
                  {modules.map((courseModule, index) => (
                    <i
                      key={courseModule.id}
                      className={index === safeModuleIndex ? 'active' : ''}
                    />
                  ))}
                </div>
                <button
                  onClick={() => changeModule(safeModuleIndex + 1)}
                  disabled={safeModuleIndex === modules.length - 1}
                  aria-label="Next module"
                >
                  <svg viewBox="0 0 20 20">
                    <path d="m8 5 5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="chart-slide-nav" aria-label="Progress chart views">
          <button
            className={chartSlide === 'activity' ? 'active' : ''}
            onClick={() => setChartSlide('activity')}
            aria-label="Show activity chart"
            aria-current={chartSlide === 'activity' ? 'true' : undefined}
          />
          <button
            className={chartSlide === 'scores' ? 'active' : ''}
            onClick={() => setChartSlide('scores')}
            aria-label="Show lesson scores"
            aria-current={chartSlide === 'scores' ? 'true' : undefined}
          />
          <span>
            {chartSlide === 'activity'
              ? 'Swipe for lesson scores'
              : 'Swipe back to activity'}
          </span>
        </div>
      </div>
      <div className="day-type-grid">
        <div>
          <b>{weekday}</b>
          <span>Weekday lessons</span>
        </div>
        <div>
          <b>{builds}</b>
          <span>Builds</span>
        </div>
        <div>
          <b>{practices}</b>
          <span>Practices</span>
        </div>
      </div>
      <section className="module-progress-list">
        <h2>Modules</h2>
        {modules.map((courseModule, index) => {
          const progress = moduleProgress(state, courseModule);
          return (
            <Link
              href={`/app/modules/${courseModule.slug}`}
              key={courseModule.id}
            >
              <span>{index + 1}</span>
              <div>
                <b>{shortModuleTitle(courseModule.id)}</b>
                <small>{progress.completed}/7 complete</small>
                <i>
                  <em style={{ width: `${progress.percentage}%` }} />
                </i>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

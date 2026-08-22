'use client';

import Link from 'next/link';
import { useLearning } from '@/app/providers';
import { moduleDetailTitle } from '@/content/modules';
import {
  assignedModules,
  isUnitComplete,
  isUnitUnlocked,
  moduleProgress,
} from '@/lib/learning/progression';
import type { CurriculumModule, LearningUnit } from '@/lib/learning/types';

const unitLabel = (unit: LearningUnit, index: number) =>
  unit.kind === 'build'
    ? `Day ${index + 1} · Build`
    : unit.kind === 'practice'
      ? `Day ${index + 1} · Practice`
      : `Day ${index + 1}`;

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="3" />
      <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export function ModuleOverview({ module }: { module: CurriculumModule }) {
  const { state, ready } = useLearning();
  if (!ready) return <div className="state-message">Loading module…</div>;
  const position =
    assignedModules(state).findIndex((m) => m.id === module.id) + 1;
  const progress = moduleProgress(state, module);
  const currentIndex = module.units.findIndex(
    (unit) => isUnitUnlocked(state, unit.id) && !isUnitComplete(state, unit.id),
  );
  const nextIndex = currentIndex < 0 ? module.units.length - 1 : currentIndex;
  const nextUnit = module.units[nextIndex];
  const totalMinutes = module.units.reduce(
    (total, unit) => total + unit.estimatedMinutes,
    0,
  );

  return (
    <article className="sixa-module">
      <header className="sixa-module-hero">
        <nav className="sixa-module-actions" aria-label="Module actions">
          <Link href="/app/courses" aria-label="Back to courses">
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        </nav>
        <svg
          className="sixa-module-art"
          viewBox="0 0 120 110"
          aria-hidden="true"
        >
          <rect x="16" y="24" width="76" height="58" rx="12" />
          <path d="M28 44h44M28 56h30" />
          <circle cx="94" cy="76" r="18" />
          <path d="m86 76 6 6 11-12" />
        </svg>
        <div className="sixa-module-title">
          <span>MODULE {position || module.id}</span>
          <h1>{moduleDetailTitle(module.id)}</h1>
        </div>
      </header>
      <div className="sixa-module-sheet">
        <div className="sixa-module-stats">
          <div>
            <span>LESSONS</span>
            <strong>{module.units.length}</strong>
          </div>
          <div>
            <span>TIME</span>
            <strong>{totalMinutes} mins</strong>
          </div>
          <div>
            <span>DONE</span>
            <strong>
              {progress.completed}/{progress.total}
            </strong>
          </div>
        </div>
        <p className="sixa-module-outcome">{module.outcome}</p>
        <div className="sixa-unit-heading">
          <h2>Your {module.units.length} days</h2>
          <span>
            {progress.completed === progress.total
              ? 'Module complete'
              : `Day ${nextIndex + 1} next`}
          </span>
        </div>
        <div className="sixa-unit-list">
          {module.units.map((unit, index) => {
            const complete = isUnitComplete(state, unit.id);
            const current = index === currentIndex;
            const unlocked = isUnitUnlocked(state, unit.id);
            const row = (
              <>
                <span className="sixa-unit-chip">
                  {complete ? (
                    '✓'
                  ) : current ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m9 6 9 6-9 6Z" />
                    </svg>
                  ) : (
                    <LockIcon />
                  )}
                </span>
                <span className="sixa-unit-copy">
                  <small>{unitLabel(unit, index)}</small>
                  <strong>{unit.title}</strong>
                  <span>{unit.estimatedMinutes} mins</span>
                  {unit.kind !== 'lesson' && (
                    <em>
                      {unit.kind === 'build'
                        ? 'Weekend build'
                        : 'Guided practice'}
                    </em>
                  )}
                </span>
              </>
            );
            return unlocked || complete ? (
              <Link
                href={`/app/modules/${module.slug}/${unit.day}`}
                className={`sixa-unit-row ${complete ? 'is-complete' : ''} ${current ? 'is-current' : ''}`}
                key={unit.id}
              >
                {row}
              </Link>
            ) : (
              <div
                className="sixa-unit-row is-locked"
                key={unit.id}
                aria-label={`${unit.title}, locked`}
              >
                {row}
              </div>
            );
          })}
        </div>
        {progress.completed < progress.total && (
          <Link
            className="sixa-primary-action"
            href={`/app/modules/${module.slug}/${nextUnit.day}`}
          >
            {progress.completed ? 'Continue' : 'Start'} Day {nextIndex + 1}
          </Link>
        )}
      </div>
    </article>
  );
}

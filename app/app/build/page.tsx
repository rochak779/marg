'use client';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { useLearning } from '@/app/providers';
import {
  assignedUnits,
  isUnitUnlocked,
  nextUnit,
} from '@/lib/learning/progression';
import type { BuildUnit } from '@/lib/learning/types';

export default function BuildHub() {
  const { state, ready } = useLearning();
  if (!ready) return <div className="state-message">Loading Build…</div>;
  const current = nextUnit(state);
  const builds = assignedUnits(state).filter(
    (unit): unit is BuildUnit => unit.kind === 'build',
  );
  const open = builds.filter((unit) => isUnitUnlocked(state, unit.id));
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Create your path first.</h1>
        <p className="muted">Your practical Builds will appear here.</p>
        <Link className="btn" href="/assessment">
          Create my path
        </Link>
      </div>
    );
  return (
    <div className="build-hub">
      <header>
        <div className="build-brand">
          <Link href="/app/settings" aria-label="Open settings">
            {state.profile?.avatarSeed ? (
              <Avatar className="avatar" seed={state.profile.avatarSeed} />
            ) : (
              <span className="avatar">म</span>
            )}
          </Link>
          <b>Build</b>
        </div>
        <span className="build-open-count">
          <i />
          {open.length} open
        </span>
        <div className="build-title">
          <h1>
            Build it,
            <br />
            just don’t read it.
          </h1>
        </div>
      </header>
      <div className="build-sheet">
        {open.length === 0 && current && (
          <Link
            className="build-continue build-unlock-notice"
            href={`/app/modules/module-${current.id.split('-')[1]}/${current.day}`}
          >
            <span>Complete the current lesson to unlock your first Build</span>
            <svg viewBox="0 0 24 24">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        )}
        <div className="build-sheet-title">
          <b>Your Builds</b>
          <span>
            {
              builds.filter((unit) => state.completedUnitIds.includes(unit.id))
                .length
            }{' '}
            complete
          </span>
        </div>
        {(['Done', 'Upcoming'] as const).map((section) => {
          const inSection = builds
            .map((unit, index) => ({ unit, index }))
            .filter(({ unit }) => {
              const complete = state.completedUnitIds.includes(unit.id);
              return section === 'Done' ? complete : !complete;
            });
          if (inSection.length === 0) return null;
          return (
            <div className="course-section" key={section}>
              <h3 className="course-section-heading">{section}</h3>
              {inSection.map(({ unit, index }) => {
                const unlocked = isUnitUnlocked(state, unit.id);
                const complete = state.completedUnitIds.includes(unit.id);
                const moduleId = unit.id.split('-')[1];
                const href = `/app/modules/module-${moduleId}/${unit.day}`;
                const cardContent = (
                  <>
                    <span className="build-card-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 19 8 18l9.5-9.5a2.1 2.1 0 0 0-3-3L5 15l-1 4Z" />
                        <path d="m14.5 6.5 3 3" />
                      </svg>
                    </span>
                    <div>
                      <b>{unit.title}</b>
                      <p>
                        Module {index + 1} · {unit.estimate}
                      </p>
                    </div>
                    {unlocked || complete ? (
                      <span className="build-card-chevron" aria-hidden>
                        <svg viewBox="0 0 24 24">
                          <path d="m9 6 6 6-6 6" />
                        </svg>
                      </span>
                    ) : (
                      <span className="build-lock" aria-label="Locked">
                        <svg viewBox="0 0 24 24">
                          <rect x="6" y="10" width="12" height="10" rx="3" />
                          <path d="M9 10V7a3 3 0 0 1 6 0v3" />
                        </svg>
                      </span>
                    )}
                  </>
                );
                return unlocked || complete ? (
                  <Link
                    className={`build-hub-card ${complete ? 'complete' : ''}`}
                    href={href}
                    key={unit.id}
                    aria-label={`${complete ? 'Review' : 'Open'} ${unit.title}`}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div className="build-hub-card locked" key={unit.id}>
                    {cardContent}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const open = builds.filter(
    (unit) =>
      isUnitUnlocked(state, unit.id) &&
      !state.completedUnitIds.includes(unit.id),
  );
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
        <svg viewBox="0 0 140 130" aria-hidden>
          <path d="M56 22h28v30l22 44a10 10 0 0 1-9 15H43a10 10 0 0 1-9-15l22-44V22Z" />
          <path d="M42 92h56l10 20a8 8 0 0 1-7 12H39a8 8 0 0 1-7-12l10-20Z" />
          <path d="M52 20h36" />
          <circle cx="60" cy="106" r="5" />
          <circle cx="84" cy="112" r="3.5" />
        </svg>
        <div className="build-title">
          <h1>
            Build it,
            <br />
            don’t just read it
          </h1>
        </div>
      </header>
      <div className="build-sheet">
        {open.length === 0 && current && (
          <Link
            className="build-continue build-unlock-notice"
            href={`/app/modules/module-${current.id.split('-')[1]}/${current.day}`}
          >
            <span>Complete the current unit to unlock your first Build</span>
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
        {builds.map((unit, index) => {
          const unlocked = isUnitUnlocked(state, unit.id);
          const complete = state.completedUnitIds.includes(unit.id);
          const moduleId = unit.id.split('-')[1];
          const href = `/app/modules/module-${moduleId}/saturday`;
          return (
            <div
              className={`build-hub-card ${unlocked || complete ? '' : 'locked'}`}
              key={unit.id}
            >
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
                <Link
                  href={href}
                  aria-label={`${complete ? 'Review' : 'Open'} ${unit.title}`}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </Link>
              ) : (
                <span className="build-lock" aria-label="Locked">
                  <svg viewBox="0 0 24 24">
                    <rect x="6" y="10" width="12" height="10" rx="3" />
                    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

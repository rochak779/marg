'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useLearning } from '@/app/providers';
import { moduleById } from '@/content/modules';
import { nextUnit, progressSummary } from '@/lib/learning/progression';

export default function NotificationsPage() {
  const { state, ready } = useLearning();
  const [read, setRead] = useState(false);
  if (!ready)
    return <div className="state-message">Loading notifications…</div>;
  const unit = nextUnit(state);
  const summary = progressSummary(state);
  const courseModule = unit
    ? moduleById(Number(unit.id.split('-')[1]))
    : undefined;
  const unitDayNumber =
    unit && courseModule
      ? courseModule.units.findIndex((item) => item.id === unit.id) + 1
      : 0;
  const items = [
    {
      kind: 'ready',
      title: unit
        ? `${unit.kind === 'build' ? 'Build' : unit.kind === 'practice' ? 'Practice' : `Day ${unitDayNumber}`} is ready`
        : 'Your path is complete',
      body:
        unit && courseModule
          ? `${courseModule.title}: ${unit.title}`
          : 'Every assigned lesson has been completed.',
      time: 'Now',
      href:
        unit && courseModule
          ? `/app/modules/${courseModule.slug}/${unit.day}`
          : '/app/progress',
    },
    {
      kind: 'progress',
      title: `${summary.percentage}% of your path complete`,
      body: `${summary.completed} of ${summary.total} lessons · ${summary.minutes} learning minutes`,
      time: 'Today',
      href: '/app/progress',
    },
  ];
  return (
    <div className="notifications-view">
      <header>
        <div className="notification-top">
          <Link href="/app" aria-label="Close notifications">
            <svg viewBox="0 0 24 24">
              <path d="m14.5 6-6 6 6 6" />
            </svg>
          </Link>
          <button onClick={() => setRead(true)}>MARK ALL READ</button>
        </div>
        <div className="notification-heading">
          <div>
            <h1>Notifications</h1>
            <p>
              {read
                ? 'You’re all caught up'
                : `${items.length} updates · nudges and unlocks`}
            </p>
          </div>
          <span>
            <svg viewBox="0 0 70 70" aria-hidden>
              <circle cx="35" cy="35" r="27" />
              <path d="M45 40v-6a10 10 0 1 0-20 0v6l-3 5h26l-3-5Z" />
              <path d="M31 47a4 4 0 0 0 8 0" />
            </svg>
          </span>
        </div>
      </header>
      <div className="notification-list">
        <div className="notification-filter">
          <b>TODAY</b>
          <span>All</span>
        </div>
        {items.map((item, index) => (
          <Link href={item.href} className="notification-row" key={item.title}>
            <i className={item.kind}>
              <svg viewBox="0 0 24 24">
                {item.kind === 'ready' ? (
                  <>
                    <rect x="5" y="11" width="14" height="9" rx="3" />
                    <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
                  </>
                ) : (
                  <path d="M6 18v-5m6 5V7m6 11v-8" />
                )}
              </svg>
            </i>
            <div>
              <span>
                <b>{item.title}</b>
                <small>{item.time}</small>
                {!read && index === 0 && <em />}
              </span>
              <p>{item.body}</p>
              <strong>{index === 0 ? 'Continue' : 'View progress'}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

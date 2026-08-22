'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { useLearning } from '@/app/providers';
import { eligibleDuelModules } from '@/lib/learning/duel';
import { getDuelSummary, type DuelSummary } from '@/lib/learning/duel-actions';
import { DuelBattle } from '@/components/learning/DuelBattle';
import type { CurriculumModule } from '@/lib/learning/types';

type Screen = 'list' | 'brief' | 'matching' | 'battle';

export default function DuelsHub() {
  const { state, ready } = useLearning();
  const [screen, setScreen] = useState<Screen>('list');
  const [selected, setSelected] = useState<CurriculumModule | null>(null);
  const [summary, setSummary] = useState<DuelSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getDuelSummary().then((result) => {
      if (!cancelled) setSummary(result);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (screen !== 'matching' || !selected) return;
    const timer = window.setTimeout(() => setScreen('battle'), 1500);
    return () => window.clearTimeout(timer);
  }, [screen, selected]);

  if (!ready) return <div className="state-message">Loading challenges…</div>;
  if (!state.path)
    return (
      <div className="state-message">
        <h1>Create your path first.</h1>
        <p className="muted">Duels unlock once you have a learning path.</p>
        <Link className="btn" href="/assessment">
          Create my path
        </Link>
      </div>
    );

  const eligible = eligibleDuelModules(state);
  const current = eligible.find((entry) => entry.isCurrent);
  const completed = eligible.filter((entry) => !entry.isCurrent);

  if (screen === 'battle' && selected) {
    return (
      <DuelBattle
        module={selected}
        initialSummary={summary}
        avatarSeed={state.profile?.avatarSeed}
        onExit={() => {
          setScreen('list');
          setSelected(null);
          setRefreshKey((key) => key + 1);
        }}
      />
    );
  }

  if (screen === 'matching' && selected) {
    return (
      <article className="duel-matching">
        <header className="duel-flow-header">
          <button
            type="button"
            onClick={() => setScreen('brief')}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span>Finding an opponent</span>
          <i />
        </header>
        <div className="duel-matching-vs">
          <div className="duel-matching-side">
            <Avatar className="avatar" seed={state.profile?.avatarSeed ?? 'you'} />
            <span>You</span>
          </div>
          <span className="duel-matching-vs-label">VS</span>
          <div className="duel-matching-side">
            <span className="duel-bot-avatar" aria-hidden="true">
              🤖
            </span>
            <span>Marg Bot</span>
          </div>
        </div>
        <p className="duel-matching-status">Matching you on level and topic…</p>
      </article>
    );
  }

  if (screen === 'brief' && selected) {
    return (
      <article className="duel-brief">
        <header className="duel-flow-header">
          <button
            type="button"
            onClick={() => setScreen('list')}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span>Daily duel</span>
          <i />
        </header>
        <p className="duel-brief-eyebrow">{selected.title.toUpperCase()}</p>
        <h1>
          Five questions.
          <br />
          Fastest correct wins.
        </h1>
        <p className="duel-brief-copy">
          20 seconds a question. Right answers score 20, speed breaks ties.
          You&apos;ll duel Marg Bot. Live matchmaking with other learners is
          coming later.
        </p>
        <div className="duel-brief-stats">
          <div>
            <span>QUESTIONS</span>
            <strong>5</strong>
          </div>
          <div>
            <span>PER Q</span>
            <strong>20s</strong>
          </div>
          <div>
            <span>REWARD</span>
            <strong>60</strong>
          </div>
        </div>
        <div className="duel-house-rules">
          <p>HOUSE RULES</p>
          <ol>
            <li>One answer per question, locked when tapped.</li>
            <li>Leaving mid-battle counts as a loss.</li>
            <li>Right or wrong shows immediately after you answer.</li>
          </ol>
        </div>
        <footer>
          <button
            type="button"
            className="duel-primary-action"
            onClick={() => setScreen('matching')}
          >
            Start challenge
          </button>
        </footer>
      </article>
    );
  }

  return (
    <div className="duel-hub">
      <header className="duel-hub-header">
        <div className="duel-hub-brand">
          <Link href="/app/settings" aria-label="Open settings">
            {state.profile?.avatarSeed ? (
              <Avatar className="avatar" seed={state.profile.avatarSeed} />
            ) : (
              <span className="avatar">म</span>
            )}
          </Link>
          <b className="duel-hub-title">Challenges</b>
        </div>
      </header>
      <div className="duel-hub-stats">
        <div className="duel-stat duel-stat-purple">
          <span>WINS</span>
          <strong>{summary?.wins ?? 0}</strong>
        </div>
        <div className="duel-stat duel-stat-orange">
          <span>STREAK</span>
          <strong>{summary?.streak ?? 0}</strong>
        </div>
        <div className="duel-stat duel-stat-orange">
          <span>RANK</span>
          <strong>{summary?.rank ? `#${summary.rank}` : '-'}</strong>
        </div>
      </div>
      <div className="duel-hub-list">
        <h2>Open challenges</h2>
        {eligible.length === 0 && (
          <p className="duel-empty">
            Complete your first lesson to unlock Duels.
          </p>
        )}
        {current && (
          <div
            className="duel-hero-card"
            onClick={() => {
              setSelected(current.module);
              setScreen('brief');
            }}
          >
            <span className="duel-hero-eyebrow">DAILY DUEL</span>
            <h3>{current.module.title}</h3>
            <p>5 questions · 20s each · 60 XP</p>
            <span className="duel-hero-cta">Start</span>
          </div>
        )}
        {completed.map((entry) => (
          <div
            className="duel-list-card"
            key={entry.module.id}
            onClick={() => {
              setSelected(entry.module);
              setScreen('brief');
            }}
          >
            <div>
              <b>{entry.module.title}</b>
              <p>5 questions · 60 XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

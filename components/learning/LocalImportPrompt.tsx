'use client';
import { useEffect, useState } from 'react';
import { useLearning } from '@/app/providers';
import { loadState, resetState } from '@/lib/learning/persistence';
import { importLocalState } from '@/lib/learning/import-actions';

// One-time offer to bring old browser-only progress into the account. Only
// ever shows if the browser has legacy localStorage state AND the server
// hasn't already recorded an import for this account (checked server-side
// via record_local_state_import's idempotent insert).
export function LocalImportPrompt() {
  const { state, ready, setState } = useLearning();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'importing' | 'error'>('idle');

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      const local = loadState(window.localStorage);
      const hasLocalProgress =
        local.assessment !== null ||
        local.completedUnitIds.length > 0 ||
        Object.keys(local.quizResults).length > 0;
      setVisible(hasLocalProgress);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [ready]);

  if (!visible) return null;

  const hasServerProgress = state.assessment !== null;

  const dismiss = () => {
    setVisible(false);
  };

  const runImport = async () => {
    setStatus('importing');
    const local = loadState(window.localStorage);
    const result = await importLocalState(local);
    if (!result.ok) {
      setStatus('error');
      return;
    }
    setState(result.state);
    resetState(window.localStorage);
    setVisible(false);
  };

  return (
    <div className="import-banner" role="status">
      <p>
        <b>We found progress saved in this browser.</b>{' '}
        {hasServerProgress
          ? 'Your account already has progress — importing will only add units that fit your current path, and never overwrites what is already saved.'
          : 'Import it into your account so it is here on every device.'}
      </p>
      {status === 'error' && (
        <p className="import-banner-error">
          Import failed. Your browser progress is untouched — try again.
        </p>
      )}
      <div className="import-banner-actions">
        <button
          type="button"
          className="btn"
          onClick={runImport}
          disabled={status === 'importing'}
        >
          {status === 'importing' ? 'Importing…' : 'Import my progress'}
        </button>
        <button type="button" className="btn ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}

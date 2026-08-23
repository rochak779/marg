'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import posthog from 'posthog-js';
import { freshState } from '@/lib/learning/persistence';
import { loadSnapshot } from '@/lib/learning/server-actions';
import type { LearningState } from '@/lib/learning/types';

type LearningContextValue = {
  state: LearningState;
  ready: boolean;
  setState: (state: LearningState) => void;
  refresh: () => Promise<void>;
};
const LearningContext = createContext<LearningContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState>(freshState);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const snapshot = await loadSnapshot();
    setState(snapshot);
    setReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  // Ties PostHog's distinct_id to the Supabase user id once it's known, so
  // client-side track() calls and server-side captureServerEvent() calls
  // (auth, duels) land on the same person. No email/name passed — see the
  // no-PII rule in PRD analytics notes.
  const identifiedId = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const id = state.profile?.id || null;
    if (id === identifiedId.current) return;
    identifiedId.current = id;
    if (id) {
      posthog.identify(id);
    } else {
      posthog.reset();
    }
  }, [ready, state.profile?.id]);

  return (
    <LearningContext.Provider value={{ state, ready, setState, refresh }}>
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning must be used within Providers');
  return value;
}

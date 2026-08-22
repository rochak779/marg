'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
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

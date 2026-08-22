'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { freshState, loadState, saveState } from '@/lib/learning/persistence';
import type { LearningState } from '@/lib/learning/types';

type LearningContextValue = {
  state: LearningState;
  ready: boolean;
  update: (updater: (state: LearningState) => LearningState) => void;
};
const LearningContext = createContext<LearningContextValue | null>(null);
export function Providers({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState>(freshState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadState(window.localStorage);
      stateRef.current = loaded;
      setState(loaded);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const update = useCallback(
    (updater: (current: LearningState) => LearningState) => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      saveState(next, window.localStorage);
      setState(next);
    },
    [],
  );
  const value = useMemo(
    () => ({ state, ready, update }),
    [state, ready, update],
  );
  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error('useLearning must be used within Providers');
  return value;
}

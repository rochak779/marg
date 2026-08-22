import type { LearningState } from './types';
import { learningStateSchema } from './validation';

export const STORAGE_KEY = 'marg-learning-state-v1';
export const freshState = (): LearningState => ({
  version: 1,
  assessment: null,
  path: null,
  completedUnitIds: [],
  quizResults: {},
  builds: {},
  practices: {},
  profile: null,
  completionDates: {},
});

export function loadState(storage?: Pick<Storage, 'getItem'>): LearningState {
  if (!storage) return freshState();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    return learningStateSchema.parse(JSON.parse(raw)) as LearningState;
  } catch {
    return freshState();
  }
}
export function saveState(
  state: LearningState,
  storage?: Pick<Storage, 'setItem'>,
) {
  if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(state));
}
export function resetState(storage?: Pick<Storage, 'removeItem'>) {
  storage?.removeItem(STORAGE_KEY);
}

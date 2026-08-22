import { describe, expect, it } from 'vitest';
import { freshState, loadState, saveState, STORAGE_KEY } from '../persistence';
describe('persistence', () => {
  it('recovers from corrupted data', () => {
    expect(loadState({ getItem: () => '{broken' })).toEqual(freshState());
  });
  it('round trips valid state', () => {
    let value = '';
    saveState(freshState(), {
      setItem: (key, next) => {
        expect(key).toBe(STORAGE_KEY);
        value = next;
      },
    });
    expect(loadState({ getItem: () => value })).toEqual(freshState());
  });
});

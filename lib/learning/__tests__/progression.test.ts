import { describe, expect, it } from 'vitest';
import { derivePath } from '../assessment';
import {
  completeUnit,
  isUnitUnlocked,
  learningStreak,
  monthlyLessonActivity,
  nextUnit,
  progressSummary,
  weeklyLessonActivity,
} from '../progression';
import { freshState } from '../persistence';
import type { LearningState } from '../types';
describe('progression', () => {
  it('unlocks sequentially and computes progress', () => {
    let state: LearningState = {
      ...freshState(),
      path: derivePath({
        beyondDrafting: true,
        context: 'feedback',
        builtWorkflow: false,
      }),
    };
    const first = nextUnit(state)!;
    expect(isUnitUnlocked(state, first.id)).toBe(true);
    state = completeUnit(state, first.id);
    expect(progressSummary(state)).toMatchObject({ completed: 1, total: 35 });
    expect(nextUnit(state)?.id).not.toBe(first.id);
  });

  it('calculates a daily streak and lesson activity from completion dates', () => {
    const state: LearningState = {
      ...freshState(),
      completedUnitIds: [
        'module-1-monday',
        'module-1-tuesday',
        'module-1-saturday',
      ],
      completionDates: {
        'module-1-monday': '2026-08-20',
        'module-1-tuesday': '2026-08-21',
        'module-1-saturday': '2026-08-21',
      },
    };
    const today = new Date(2026, 7, 21, 12);
    expect(learningStreak(state, today)).toBe(2);
    expect(
      weeklyLessonActivity(state, today).find((day) => day.label === 'Fri')
        ?.value,
    ).toBe(1);
    expect(monthlyLessonActivity(state, today).at(-1)?.value).toBe(2);
  });

  it('resets the streak when no lesson was completed today', () => {
    const state: LearningState = {
      ...freshState(),
      completionDates: { 'module-1-monday': '2026-08-20' },
    };
    expect(learningStreak(state, new Date(2026, 7, 21, 12))).toBe(0);
  });
});

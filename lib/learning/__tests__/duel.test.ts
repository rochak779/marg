import { describe, expect, it } from 'vitest';
import { curriculum } from '@/content/modules';
import { derivePath } from '../assessment';
import { completeUnit } from '../progression';
import { freshState } from '../persistence';
import {
  BOT_ACCURACY,
  DUEL_QUESTION_COUNT,
  eligibleDuelModules,
  pickDuelQuestions,
  resolveBotAnswer,
  scoreDuel,
  xpForOutcome,
} from '../duel';
import type { LearningState } from '../types';

function pathState(): LearningState {
  return {
    ...freshState(),
    path: derivePath({
      beyondDrafting: true,
      context: 'feedback',
      builtWorkflow: false,
    }),
  };
}

describe('eligibleDuelModules', () => {
  it('includes only the current module before any lesson is completed', () => {
    const eligible = eligibleDuelModules(pathState());
    expect(eligible).toHaveLength(1);
    expect(eligible[0].isCurrent).toBe(true);
  });

  it('adds a completed module once its units are done, keeping current flag correct', () => {
    let state = pathState();
    const firstModule = state.path!.assignedModuleIds[0];
    const module = curriculum.find((m) => m.id === firstModule)!;
    for (const unit of module.units) {
      state = completeUnit(state, unit.id);
    }
    const eligible = eligibleDuelModules(state);
    expect(eligible.length).toBeGreaterThanOrEqual(2);
    const completedEntry = eligible.find((e) => e.module.id === firstModule)!;
    expect(completedEntry.isCurrent).toBe(false);
    expect(eligible.filter((e) => e.isCurrent)).toHaveLength(1);
  });
});

describe('pickDuelQuestions', () => {
  it('draws DUEL_QUESTION_COUNT unique questions from the module pool', () => {
    const module = curriculum[0];
    const questions = pickDuelQuestions(module, () => 0.5);
    expect(questions).toHaveLength(DUEL_QUESTION_COUNT);
    expect(new Set(questions.map((q) => q.id)).size).toBe(DUEL_QUESTION_COUNT);
    const pool = new Set(
      module.units
        .filter((u) => u.kind === 'lesson')
        .flatMap((u) => u.quiz.map((q) => q.id)),
    );
    for (const q of questions) expect(pool.has(q.id)).toBe(true);
  });
});

describe('resolveBotAnswer', () => {
  it('stays near BOT_ACCURACY over many trials and within the time cap', () => {
    const module = curriculum[0];
    const question = module.units.find((u) => u.kind === 'lesson')!.quiz[0];
    let correct = 0;
    const trials = 2000;
    for (let i = 0; i < trials; i++) {
      const answer = resolveBotAnswer(question, Math.random);
      if (answer.correct) correct += 1;
      expect(answer.delayMs).toBeGreaterThanOrEqual(4000);
      expect(answer.delayMs).toBeLessThanOrEqual(18000);
    }
    const rate = correct / trials;
    expect(rate).toBeGreaterThan(BOT_ACCURACY - 0.05);
    expect(rate).toBeLessThan(BOT_ACCURACY + 0.05);
  });
});

describe('scoreDuel', () => {
  it('scores 20 points per correct answer', () => {
    expect(scoreDuel(3, 10000, 2, 12000)).toMatchObject({
      userScore: 60,
      botScore: 40,
      outcome: 'win',
    });
  });

  it('breaks a tied score by speed', () => {
    expect(scoreDuel(3, 9000, 3, 15000).outcome).toBe('win');
    expect(scoreDuel(3, 15000, 3, 9000).outcome).toBe('loss');
  });

  it('draws on identical score and time', () => {
    expect(scoreDuel(3, 10000, 3, 10000).outcome).toBe('draw');
  });
});

describe('xpForOutcome', () => {
  it('awards 60/40/20 for win/draw/loss', () => {
    expect(xpForOutcome('win')).toBe(60);
    expect(xpForOutcome('draw')).toBe(40);
    expect(xpForOutcome('loss')).toBe(20);
  });
});

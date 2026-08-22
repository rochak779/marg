import { assignedModules, courseState } from './progression';
import type {
  CurriculumModule,
  LearningState,
  LessonUnit,
  QuizQuestion,
} from './types';

export const BOT_NAME = 'Marg Bot';
export const DUEL_QUESTION_COUNT = 5;
export const DUEL_QUESTION_SECONDS = 20;
export const BOT_ACCURACY = 0.7;
export const BOT_MIN_DELAY_MS = 4000;
export const BOT_MAX_DELAY_MS = 18000;

export type DuelOutcome = 'win' | 'loss' | 'draw';
export const XP_BY_OUTCOME: Record<DuelOutcome, number> = {
  win: 60,
  draw: 40,
  loss: 20,
};
const POINTS_PER_CORRECT = 20;

export interface EligibleDuelModule {
  module: CurriculumModule;
  isCurrent: boolean;
}
export interface BotAnswer {
  correct: boolean;
  delayMs: number;
}
export interface DuelScore {
  userScore: number;
  botScore: number;
  outcome: DuelOutcome;
}

export function eligibleDuelModules(
  state: LearningState,
): EligibleDuelModule[] {
  return assignedModules(state)
    .map((module) => ({ module, status: courseState(state, module) }))
    .filter((entry) => entry.status !== 'Upcoming')
    .map((entry) => ({
      module: entry.module,
      isCurrent: entry.status === 'Current',
    }));
}

export function pickDuelQuestions(
  module: CurriculumModule,
  random: () => number = Math.random,
): QuizQuestion[] {
  const pool = module.units
    .filter((unit): unit is LessonUnit => unit.kind === 'lesson')
    .flatMap((unit) => unit.quiz);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DUEL_QUESTION_COUNT);
}

export function resolveBotAnswer(
  question: QuizQuestion,
  random: () => number = Math.random,
): BotAnswer {
  void question;
  const correct = random() < BOT_ACCURACY;
  const delayMs = Math.round(
    BOT_MIN_DELAY_MS + random() * (BOT_MAX_DELAY_MS - BOT_MIN_DELAY_MS),
  );
  return { correct, delayMs };
}

export function scoreDuel(
  userCorrectCount: number,
  userTimeMs: number,
  botCorrectCount: number,
  botTimeMs: number,
): DuelScore {
  const userScore = userCorrectCount * POINTS_PER_CORRECT;
  const botScore = botCorrectCount * POINTS_PER_CORRECT;
  let outcome: DuelOutcome;
  if (userScore > botScore) outcome = 'win';
  else if (userScore < botScore) outcome = 'loss';
  else if (userTimeMs < botTimeMs) outcome = 'win';
  else if (userTimeMs > botTimeMs) outcome = 'loss';
  else outcome = 'draw';
  return { userScore, botScore, outcome };
}

export function xpForOutcome(outcome: DuelOutcome): number {
  return XP_BY_OUTCOME[outcome];
}

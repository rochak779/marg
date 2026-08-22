import { z } from 'zod';

const answers = z.object({
  beyondDrafting: z.boolean(),
  context: z.enum(['feedback', 'requests', 'communication', 'prototyping']),
  builtWorkflow: z.boolean(),
});
const path = z.object({
  entryLevel: z.enum(['basic', 'advanced']),
  guidanceLevel: z.enum(['full', 'reduced']),
  assignedModuleIds: z.array(z.number().int().min(1).max(5)),
});
const quizResult = z.object({
  answers: z.array(z.number().int()),
  score: z.number().int().min(0).max(3),
  attempts: z.number().int().positive(),
  completedAt: z.string(),
});
const build = z.object({
  tool: z.enum(['chatgpt', 'claude']),
  checkedSteps: z.array(z.number().int()),
  checkedCriteria: z.array(z.number().int()),
  ranWorkflow: z.boolean(),
});
const practice = z.object({
  checkedRules: z.array(z.number().int()),
  reflections: z.record(z.string(), z.string()),
  revealedHints: z.number().int().nonnegative(),
});
export const learningStateSchema = z.object({
  version: z.literal(1),
  assessment: answers.nullable(),
  path: path.nullable(),
  completedUnitIds: z.array(z.string()),
  quizResults: z.record(z.string(), quizResult),
  builds: z.record(z.string(), build),
  practices: z.record(z.string(), practice),
  profile: z
    .object({
      firstName: z.string(),
      email: z.string(),
      // Optional/defaulted: older localStorage snapshots (pre-avatar
      // feature) never had this field.
      avatarSeed: z.string().optional().default(''),
    })
    .nullable()
    .default(null),
  completionDates: z.record(z.string(), z.string()).default({}),
});

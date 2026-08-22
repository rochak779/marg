import type {
  AppliedContext,
  AssessmentAnswers,
  PathConfiguration,
} from './types';

export const APPLIED_ROTATIONS: Record<AppliedContext, readonly number[]> = {
  feedback: [2, 3, 4, 5],
  requests: [3, 4, 5, 2],
  communication: [4, 5, 2, 3],
  prototyping: [5, 2, 3, 4],
};

export function derivePath(answers: AssessmentAnswers): PathConfiguration {
  const entryLevel = answers.beyondDrafting ? 'advanced' : 'basic';
  return {
    entryLevel,
    guidanceLevel: answers.builtWorkflow ? 'reduced' : 'full',
    assignedModuleIds:
      entryLevel === 'basic'
        ? [1, ...APPLIED_ROTATIONS[answers.context]]
        : [...APPLIED_ROTATIONS[answers.context]],
  };
}

export function recommendationExplanation(answers: AssessmentAnswers) {
  const start = answers.beyondDrafting
    ? 'You already use AI beyond basic drafting, so your path starts with an applied workplace workflow.'
    : 'You will begin with practical foundations before moving into applied workplace workflows.';
  const focus: Record<AppliedContext, string> = {
    feedback:
      'Customer feedback is first because it is the context you use most often.',
    requests:
      'Feature requests are first because they match the work you do most often.',
    communication:
      'Product communication is first because it matches the work you do most often.',
    prototyping:
      'AI prototyping is first because it matches the work you do most often.',
  };
  return `${start} ${focus[answers.context]}`;
}

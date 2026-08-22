import type {
  AppliedContext,
  AssessmentAnswers,
  PathConfiguration,
} from './types';

// Module 1 (How Software Actually Works) is the universal foundation for
// basic learners. Module 2 (From Asking AI to Directing AI) is the AI
// foundation shown whenever the learner hasn't built a workflow yet.
const FOUNDATIONS_MODULE_ID = 1;
const AI_FOUNDATIONS_MODULE_ID = 2;
const APPLIED_MODULE_IDS = [3, 4, 5, 6] as const;

// Which applied module leads the rotation for each context. The remaining
// applied modules keep their natural order behind it.
const APPLIED_PRIORITY: Record<AppliedContext, number> = {
  feedback: 3,
  requests: 4,
  communication: 5,
  prototyping: 6,
};

function orderAppliedModules(context: AppliedContext): number[] {
  const priority = APPLIED_PRIORITY[context];
  return [priority, ...APPLIED_MODULE_IDS.filter((id) => id !== priority)];
}

export function derivePath(answers: AssessmentAnswers): PathConfiguration {
  const entryLevel = answers.beyondDrafting ? 'advanced' : 'basic';
  const guidanceLevel = answers.builtWorkflow ? 'reduced' : 'full';
  const appliedOrder = orderAppliedModules(answers.context);

  const assignedModuleIds =
    entryLevel === 'basic'
      ? [FOUNDATIONS_MODULE_ID, AI_FOUNDATIONS_MODULE_ID, ...appliedOrder]
      : guidanceLevel === 'full'
        ? [AI_FOUNDATIONS_MODULE_ID, ...appliedOrder]
        : appliedOrder;

  return { entryLevel, guidanceLevel, assignedModuleIds };
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
  return [start, focus[answers.context]];
}

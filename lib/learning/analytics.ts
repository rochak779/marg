import posthog from 'posthog-js';

export type LearningEvent =
  | 'assessment_completed'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'build_completed'
  | 'practice_completed'
  | 'assessment_retaken'
  | 'duel_completed'
  | 'module_completed';

export function track(
  event: LearningEvent,
  payload: Record<string, string | number | boolean> = {},
) {
  if (typeof window === 'undefined') return;
  posthog.capture(event, payload);
}

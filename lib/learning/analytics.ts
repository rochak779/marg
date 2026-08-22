export type LearningEvent =
  | 'assessment_completed'
  | 'lesson_completed'
  | 'quiz_submitted'
  | 'build_completed'
  | 'practice_completed'
  | 'assessment_retaken'
  | 'duel_completed';
export function track(
  _event: LearningEvent,
  _payload: Record<string, string | number | boolean> = {},
) {
  void _event;
  void _payload;
}

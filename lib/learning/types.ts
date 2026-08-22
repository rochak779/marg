export type EntryLevel = 'basic' | 'advanced';
export type AppliedContext =
  'feedback' | 'requests' | 'communication' | 'prototyping';
export type GuidanceLevel = 'full' | 'reduced';
export type DaySlug =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface AssessmentAnswers {
  beyondDrafting: boolean;
  context: AppliedContext;
  builtWorkflow: boolean;
}
export interface PathConfiguration {
  entryLevel: EntryLevel;
  guidanceLevel: GuidanceLevel;
  assignedModuleIds: number[];
}
export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
export interface LessonUnit {
  id: string;
  day: DaySlug;
  kind: 'lesson';
  title: string;
  hook: string;
  theory: string[];
  example: string;
  action: string;
  savedComponent: string;
  estimatedMinutes: 10;
  quiz: QuizQuestion[];
}
export interface BuildUnit {
  id: string;
  day: 'saturday';
  kind: 'build';
  title: string;
  outcome: string;
  estimate: string;
  estimatedMinutes: number;
  practiceInput: string;
  steps: string[];
  prompt: string;
  checks: string[];
}
export interface PracticeUnit {
  id: string;
  day: 'sunday';
  kind: 'practice';
  title: string;
  challenge: string;
  rules: string[];
  reflections: string[];
  hints: string[];
  estimatedMinutes: 15;
}
export type LearningUnit = LessonUnit | BuildUnit | PracticeUnit;
export interface CurriculumModule {
  id: number;
  slug: string;
  title: string;
  audience: string;
  outcome: string;
  weekdayComponents: string[];
  units: LearningUnit[];
}
export interface QuizResult {
  answers: number[];
  score: number;
  attempts: number;
  completedAt: string;
}
export interface BuildProgress {
  tool: 'chatgpt' | 'claude';
  checkedSteps: number[];
  checkedCriteria: number[];
  ranWorkflow: boolean;
}
export interface PracticeProgress {
  checkedRules: number[];
  reflections: Record<number, string>;
  revealedHints: number;
}
export interface LearningState {
  version: 1;
  assessment: AssessmentAnswers | null;
  path: PathConfiguration | null;
  completedUnitIds: string[];
  quizResults: Record<string, QuizResult>;
  builds: Record<string, BuildProgress>;
  practices: Record<string, PracticeProgress>;
  profile: { firstName: string; email: string } | null;
  completionDates: Record<string, string>;
}

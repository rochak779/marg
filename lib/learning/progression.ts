import { curriculum, moduleById } from '@/content/modules';
import type { CurriculumModule, LearningState, LearningUnit } from './types';

export function assignedModules(state: LearningState): CurriculumModule[] {
  return (state.path?.assignedModuleIds ?? [])
    .map(moduleById)
    .filter((module): module is CurriculumModule => Boolean(module));
}
export function assignedUnits(state: LearningState) {
  return assignedModules(state).flatMap((module) => module.units);
}
export function isUnitComplete(state: LearningState, unitId: string) {
  return state.completedUnitIds.includes(unitId);
}
// A module is complete once every one of its units (Day 1-5 lessons,
// Saturday Build, Sunday Practice) is in completedUnitIds. Practice is
// always the last unit unlocked in a module, so callers only need to check
// this right after a Practice completion — see PracticeView.
export function isModuleComplete(state: LearningState, moduleId: number) {
  const courseModule = moduleById(moduleId);
  if (!courseModule) return false;
  return courseModule.units.every((unit) => isUnitComplete(state, unit.id));
}
export function isFirstAssignedModule(state: LearningState, moduleId: number) {
  return state.path?.assignedModuleIds[0] === moduleId;
}
// 1-based position of a module within this learner's assigned order — not
// the module's raw id, since paths are personalized (assessment.ts can
// assign modules in any order). This is what "Module 1", "Module 2" in the
// UI should count off of.
export function assignedModulePosition(state: LearningState, moduleId: number) {
  return assignedModules(state).findIndex((module) => module.id === moduleId) + 1;
}
export function nextAssignedModule(state: LearningState, moduleId: number) {
  const modules = assignedModules(state);
  const index = modules.findIndex((module) => module.id === moduleId);
  return index >= 0 ? modules[index + 1] : undefined;
}
export function isLastAssignedModule(state: LearningState, moduleId: number) {
  return nextAssignedModule(state, moduleId) === undefined;
}
export function nextUnit(state: LearningState): LearningUnit | undefined {
  return assignedUnits(state).find((unit) => !isUnitComplete(state, unit.id));
}
export function isUnitUnlocked(state: LearningState, unitId: string) {
  const units = assignedUnits(state);
  const index = units.findIndex((unit) => unit.id === unitId);
  return (
    index === 0 || (index > 0 && isUnitComplete(state, units[index - 1].id))
  );
}
export function completeUnit(
  state: LearningState,
  unitId: string,
): LearningState {
  return isUnitComplete(state, unitId)
    ? state
    : {
        ...state,
        completedUnitIds: [...state.completedUnitIds, unitId],
        completionDates: {
          ...state.completionDates,
          [unitId]: localDateKey(new Date()),
        },
      };
}

const unitKindById = new Map(
  curriculum.flatMap((module) =>
    module.units.map((unit) => [unit.id, unit.kind] as const),
  ),
);

// Lesson-only activity should exclude weekend build/practice units. Known
// unit IDs are checked against the curriculum directly so this keeps working
// regardless of how a module names its days (monday/tuesday vs day1/day2).
// Unknown IDs (e.g. test fixtures) fall back to the legacy weekday suffix.
function isLessonUnitId(unitId: string) {
  const kind = unitKindById.get(unitId);
  if (kind) return kind === 'lesson';
  return !unitId.endsWith('saturday') && !unitId.endsWith('sunday');
}

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function learningStreak(state: LearningState, today = new Date()) {
  const dates = new Set(Object.values(state.completionDates));
  let streak = 0;
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weeklyLessonActivity(state: LearningState, today = new Date()) {
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = localDateKey(date);
    return {
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      value: Object.entries(state.completionDates).filter(
        ([unitId, completedDate]) =>
          completedDate === key && isLessonUnitId(unitId),
      ).length,
    };
  });
}

export function monthlyLessonActivity(
  state: LearningState,
  today = new Date(),
) {
  return Array.from({ length: 5 }, (_, reverseIndex) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (4 - reverseIndex),
      1,
    );
    const prefix = localDateKey(date).slice(0, 7);
    return {
      label: date.toLocaleDateString('en-GB', { month: 'short' }),
      value: Object.entries(state.completionDates).filter(
        ([unitId, completedDate]) =>
          completedDate.startsWith(prefix) && isLessonUnitId(unitId),
      ).length,
    };
  });
}
export function progressSummary(state: LearningState) {
  const units = assignedUnits(state);
  const completed = units.filter((unit) => isUnitComplete(state, unit.id));
  const minutes = completed.reduce(
    (sum, unit) => sum + unit.estimatedMinutes,
    0,
  );
  return {
    completed: completed.length,
    total: units.length,
    percentage: units.length
      ? Math.round((completed.length / units.length) * 100)
      : 0,
    minutes,
  };
}
export function moduleProgress(state: LearningState, module: CurriculumModule) {
  const completed = module.units.filter((unit) =>
    isUnitComplete(state, unit.id),
  ).length;
  return {
    completed,
    total: module.units.length,
    percentage: Math.round((completed / module.units.length) * 100),
  };
}
export function courseState(state: LearningState, module: CurriculumModule) {
  const progress = moduleProgress(state, module);
  if (progress.completed === 7) return 'Complete';
  const current = nextUnit(state);
  return current?.id.startsWith(`module-${module.id}-`)
    ? 'Current'
    : 'Upcoming';
}
export function curriculumIntegrity() {
  return {
    modules: curriculum.length,
    units: curriculum.reduce((sum, module) => sum + module.units.length, 0),
    lessons: curriculum
      .flatMap((module) => module.units)
      .filter((unit) => unit.kind === 'lesson').length,
    questions: curriculum
      .flatMap((module) => module.units)
      .filter((unit) => unit.kind === 'lesson')
      .reduce((sum, unit) => sum + unit.quiz.length, 0),
  };
}

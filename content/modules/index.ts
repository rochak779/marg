import rawCurriculum from '../curriculum.generated.json';
import type { CurriculumModule } from '@/lib/learning/types';

export const curriculum = rawCurriculum as CurriculumModule[];
export const moduleById = (id: number) =>
  curriculum.find((module) => module.id === id);
export const moduleBySlug = (slug: string) =>
  curriculum.find((module) => module.slug === slug);

const shortTitles: Record<number, string> = {
  1: 'Software Foundations',
  2: 'AI Foundations',
  3: 'Customer Feedback',
  4: 'Feature Requests',
  5: 'Product Communication',
  6: 'AI Prototyping',
};
export const shortModuleTitle = (id: number) =>
  shortTitles[id] ?? `Module ${id}`;

const detailTitles: Record<number, string> = {
  1: 'How Software Actually Works',
  2: 'From Asking AI to Directing AI',
  3: 'From Comments to Evidence-Backed Insights',
  4: 'Classify, Prioritise and Route Work',
  5: 'Turn Messy Inputs into Clear Updates',
  6: 'Turn an Idea into Testable Behaviour',
};
export const moduleDetailTitle = (id: number) =>
  detailTitles[id] ?? shortModuleTitle(id);

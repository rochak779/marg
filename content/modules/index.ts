import rawCurriculum from '../curriculum.generated.json';
import type { CurriculumModule } from '@/lib/learning/types';

export const curriculum = rawCurriculum as CurriculumModule[];
export const moduleById = (id: number) =>
  curriculum.find((module) => module.id === id);
export const moduleBySlug = (slug: string) =>
  curriculum.find((module) => module.slug === slug);

const shortTitles: Record<number, string> = {
  1: 'AI Foundations',
  2: 'Customer Feedback',
  3: 'Feature Requests',
  4: 'Product Communication',
  5: 'AI Prototyping',
};
export const shortModuleTitle = (id: number) =>
  shortTitles[id] ?? `Module ${id}`;

const detailTitles: Record<number, string> = {
  1: 'From Asking AI to Directing AI',
  2: 'From Comments to Evidence-Backed Insights',
  3: 'Classify, Prioritise and Route Work',
  4: 'Turn Messy Inputs into Clear Updates',
  5: 'Turn an Idea into Testable Behaviour',
};
export const moduleDetailTitle = (id: number) =>
  detailTitles[id] ?? shortModuleTitle(id);

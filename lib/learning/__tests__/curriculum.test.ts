import { describe, expect, it } from 'vitest';
import { curriculum } from '@/content/modules';
import { curriculumIntegrity } from '../progression';

describe('curriculum', () => {
  it('contains the complete brief', () => {
    expect(curriculumIntegrity()).toEqual({
      modules: 6,
      units: 42,
      lessons: 30,
      questions: 90,
    });
  });
  it('has stable unique unit IDs', () => {
    const ids = curriculum.flatMap((module) =>
      module.units.map((unit) => unit.id),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

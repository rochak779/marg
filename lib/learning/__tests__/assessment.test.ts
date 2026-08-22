import { describe, expect, it } from 'vitest';
import { derivePath } from '../assessment';
import type { AppliedContext } from '../types';

describe('assessment routing', () => {
  const contexts: AppliedContext[] = [
    'feedback',
    'requests',
    'communication',
    'prototyping',
  ];
  // Module 1 = How Software Actually Works (new universal foundation)
  // Module 2 = From Asking AI to Directing AI (AI foundation)
  // Modules 3-6 = the four applied workplace workflows
  const priorityModule: Record<AppliedContext, number> = {
    feedback: 3,
    requests: 4,
    communication: 5,
    prototyping: 6,
  };
  const expectedOrder: Record<
    'basic' | 'advancedFull' | 'advancedReduced',
    (context: AppliedContext) => number[]
  > = {
    basic: (context) => [1, 2, priorityModule[context], ...[3, 4, 5, 6].filter((id) => id !== priorityModule[context])],
    advancedFull: (context) => [2, priorityModule[context], ...[3, 4, 5, 6].filter((id) => id !== priorityModule[context])],
    advancedReduced: (context) => [priorityModule[context], ...[3, 4, 5, 6].filter((id) => id !== priorityModule[context])],
  };

  for (const context of contexts) {
    it(`routes a basic learner (${context}) through Module 1, then Module 2, then the applied rotation`, () => {
      for (const builtWorkflow of [false, true]) {
        const result = derivePath({
          beyondDrafting: false,
          context,
          builtWorkflow,
        });
        expect(result.assignedModuleIds).toEqual(expectedOrder.basic(context));
        expect(result.guidanceLevel).toBe(builtWorkflow ? 'reduced' : 'full');
      }
    });

    it(`routes an advanced learner (${context}) with full guidance through Module 2 first`, () => {
      const result = derivePath({
        beyondDrafting: true,
        context,
        builtWorkflow: false,
      });
      expect(result.assignedModuleIds).toEqual(expectedOrder.advancedFull(context));
    });

    it(`routes an advanced learner (${context}) with reduced guidance straight into the applied rotation`, () => {
      const result = derivePath({
        beyondDrafting: true,
        context,
        builtWorkflow: true,
      });
      expect(result.assignedModuleIds).toEqual(
        expectedOrder.advancedReduced(context),
      );
    });
  }
});

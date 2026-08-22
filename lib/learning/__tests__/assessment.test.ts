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
  for (const beyondDrafting of [false, true])
    for (const context of contexts)
      for (const builtWorkflow of [false, true])
        it(`routes ${beyondDrafting}/${context}/${builtWorkflow}`, () => {
          const result = derivePath({ beyondDrafting, context, builtWorkflow });
          expect(result.assignedModuleIds).toHaveLength(beyondDrafting ? 4 : 5);
          expect(result.assignedModuleIds[0]).toBe(
            beyondDrafting
              ? { feedback: 2, requests: 3, communication: 4, prototyping: 5 }[
                  context
                ]
              : 1,
          );
          expect(result.guidanceLevel).toBe(builtWorkflow ? 'reduced' : 'full');
        });
});

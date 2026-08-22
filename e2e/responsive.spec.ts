import { expect, test } from '@playwright/test';
const state = {
  version: 1,
  assessment: {
    beyondDrafting: false,
    context: 'communication',
    builtWorkflow: false,
  },
  path: {
    entryLevel: 'basic',
    guidanceLevel: 'full',
    assignedModuleIds: [1, 4, 5, 2, 3],
  },
  completedUnitIds: [],
  quizResults: {},
  builds: {},
  practices: {},
};
for (const viewport of [
  { width: 320, height: 568 },
  { width: 667, height: 375 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 1440, height: 1000 },
])
  test(`core routes fit ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(
      (state) =>
        localStorage.setItem('marg-learning-state-v1', JSON.stringify(state)),
      state,
    );
    for (const route of [
      '/app',
      '/app/courses',
      '/app/progress',
      '/app/build',
      '/app/settings',
      '/app/notifications',
      '/app/modules/module-1',
      '/app/modules/module-1/monday',
    ]) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
  });

test('short onboarding screens scroll and keep the continue action reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/onboarding');
  const phone = page.locator('.phone');
  expect(
    await phone.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await phone.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  await expect(
    page.getByRole('link', { name: /Sounds like me/ }),
  ).toBeVisible();
});

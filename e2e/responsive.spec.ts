import { expect, test } from '@playwright/test';
import {
  BASIC,
  createUser,
  deleteUser,
  signIn,
  takeAssessment,
  type TestUser,
} from './helpers';

// One signed-in user with a basic path is shared by every viewport — these
// tests only read screens, they never change progress.
let user: TestUser;
let storageState: Awaited<
  ReturnType<import('@playwright/test').BrowserContext['storageState']>
>;
test.beforeAll(async ({ browser }) => {
  user = await createUser();
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, user);
  await takeAssessment(page, BASIC);
  storageState = await context.storageState();
  await context.close();
});
test.afterAll(async () => {
  await deleteUser(user.id);
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 667, height: 375 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 1440, height: 1000 },
])
  test(`core routes fit ${viewport.width}x${viewport.height}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState, viewport });
    const page = await context.newPage();
    for (const route of [
      '/app',
      '/app/courses',
      '/app/progress',
      '/app/build',
      '/app/duels',
      '/app/settings',
      '/app/notifications',
      '/app/modules/module-1',
      '/app/modules/module-1/day1',
    ]) {
      await page.goto(route);
      // Guard against silently measuring the sign-in page instead.
      await expect(page).toHaveURL(new RegExp(`${route}$`));
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
        `${route} scrolls horizontally`,
      ).toBe(true);
    }
    await context.close();
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

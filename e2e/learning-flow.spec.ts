import { expect, test, type Page } from '@playwright/test';

const key = 'marg-learning-state-v1';
const seed = async (
  page: Page,
  completedUnitIds: string[] = [],
  guidanceLevel: 'full' | 'reduced' = 'full',
) => {
  await page.goto('/');
  await page.evaluate(
    ({ key, completedUnitIds, guidanceLevel }) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          assessment: {
            beyondDrafting: true,
            context: 'feedback',
            builtWorkflow: guidanceLevel === 'reduced',
          },
          path: {
            entryLevel: 'advanced',
            guidanceLevel,
            assignedModuleIds:
              guidanceLevel === 'reduced' ? [3, 4, 5, 6] : [2, 3, 4, 5, 6],
          },
          completedUnitIds,
          quizResults: {},
          builds: {},
          practices: {},
        }),
      ),
    { key, completedUnitIds, guidanceLevel },
  );
};

test('assessment creates the expected basic path and starts Module 1', async ({
  page,
}) => {
  await page.goto('/assessment');
  for (const [answer, next] of [
    ['No', 'Continue'],
    ['Analyse customer feedback or conduct research', 'Continue'],
    ['No', 'See my path'],
  ] as const) {
    await page.getByText(answer, { exact: true }).click();
    await page.getByRole('button', { name: new RegExp(next) }).click();
  }
  await expect(page).toHaveURL(/recommendation/);
  await expect(page.getByText('BASIC FOUNDATIONS')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'How Software Actually Works' }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Start first lesson/ }).click();
  await expect(page).toHaveURL(/module-1\/day1/);
});

test('advanced path with reduced guidance excludes AI Foundations and persists after refresh', async ({
  page,
}) => {
  await seed(page, [], 'reduced');
  await page.goto('/app/courses');
  await expect(
    page.getByText('Customer Feedback', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('AI Foundations', { exact: true })).toHaveCount(
    0,
  );
  await page.reload();
  await expect(page.getByText('4 modules')).toBeVisible();
});

test('advanced path with full guidance includes AI Foundations first', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/app/courses');
  await expect(page.getByText('AI Foundations', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Customer Feedback', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('5 modules')).toBeVisible();
});

test('weekday quiz reveals results and unlocks Tuesday', async ({ page }) => {
  await seed(page, [], 'reduced');
  await page.goto('/app/modules/module-3/monday');
  await page.getByRole('button', { name: /Check my understanding/ }).click();
  const groups = page.locator('fieldset');
  for (let index = 0; index < 3; index++)
    await groups.nth(index).getByRole('radio').first().check();
  await page.getByRole('button', { name: /Submit answers/ }).click();
  await expect(page).toHaveURL(/result/);
  await expect(page.getByText(/COMPLETE|REVIEW RECOMMENDED/)).toBeVisible();
  await expect(
    page.getByText('Answer:', { exact: false }).first(),
  ).toBeVisible();
  await page.goto('/app/modules/module-3');
  await expect(page.getByText('Tuesday').locator('..')).toContainText('Ready');
});

test('Build and Practice enforce their completion requirements', async ({
  page,
}) => {
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(
    (day) => `module-3-${day}`,
  );
  await seed(page, weekdays, 'reduced');
  await page.goto('/app/modules/module-3/saturday');
  await expect(page.getByText('Protect workplace data')).toBeVisible();
  const buildChecks = page.getByRole('checkbox');
  for (let index = 0; index < (await buildChecks.count()); index++)
    await buildChecks.nth(index).check();
  await page.getByRole('button', { name: /Complete Build/ }).click();
  await expect(
    page.getByRole('button', { name: 'Build complete' }),
  ).toBeDisabled();
  await page.goto('/app/modules/module-3/sunday');
  await expect(page.getByText('Make it your own')).toBeVisible();
  const ruleChecks = page.getByRole('checkbox');
  for (let index = 0; index < (await ruleChecks.count()); index++)
    await ruleChecks.nth(index).check();
  await page
    .getByPlaceholder('Your reflection')
    .first()
    .fill(
      'I changed the evidence rule and checked the output against its source.',
    );
  await page.getByRole('button', { name: /Complete Practice/ }).click();
  await expect(
    page.getByRole('button', { name: 'Practice complete' }),
  ).toBeDisabled();
});

test('corrupted persisted state recovers safely', async ({ page }) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, '{broken'), {
    key,
  });
  await page.goto('/app');
  await expect(
    page.getByText('Your practical AI path starts here.'),
  ).toBeVisible();
});

test('screen 5a navigation opens every refined destination', async ({
  page,
}) => {
  await seed(page);
  await page.goto('/app');
  await expect(page.getByText('Welcome Learner')).toBeVisible();
  for (const [name, route, heading] of [
    ['Courses', '/app/courses', 'My courses'],
    ['Progress', '/app/progress', 'Progress'],
    ['Build', '/app/build', 'Build it, don’t just read it'],
    ['Settings', '/app/settings', 'Settings'],
  ] as const) {
    await page.getByRole('link', { name }).click();
    await expect(page).toHaveURL(route);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'Open notifications' }).click();
  await expect(page).toHaveURL('/app/notifications');
  await expect(
    page.getByRole('heading', { name: 'Notifications' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Close notifications' }).click();
  await expect(page).toHaveURL('/app');
});

test('signup calls real Supabase auth and asks for email confirmation', async ({
  page,
}) => {
  // Sign-up now creates a real Supabase account and requires email
  // confirmation, so it can no longer complete the assessment inline.
  // Uses a unique email per run since Supabase rejects re-registration.
  const email = `aarav+${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.getByLabel('Name').fill('Aarav Sharma');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('a-secure-password');
  await page.getByRole('button', { name: 'Create my learning path' }).click();
  await expect(
    page.getByRole('heading', { name: 'Confirm your account to continue.' }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
});

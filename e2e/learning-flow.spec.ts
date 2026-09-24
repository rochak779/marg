import {
  ADVANCED_FULL,
  ADVANCED_REDUCED,
  BASIC,
  admin,
  completeQuiz,
  expect,
  seedCompleted,
  signIn,
  takeAssessment,
  test,
  unitIds,
} from './helpers';

test('assessment creates the expected basic path and starts Module 1', async ({
  page,
}) => {
  await takeAssessment(page, BASIC);
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
  await takeAssessment(page, ADVANCED_REDUCED);
  await page.goto('/app/courses');
  // Course cards are titled "Module N: <short title>".
  await expect(
    page.getByRole('heading', { name: /Customer Feedback/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /AI Foundations/ }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('4 modules')).toBeVisible();
  await expect(page.getByText('28 lessons')).toBeVisible();
});

test('advanced path with full guidance includes AI Foundations first', async ({
  page,
}) => {
  await takeAssessment(page, ADVANCED_FULL);
  await page.goto('/app/courses');
  await expect(
    page.getByRole('heading', { name: 'Module 1: AI Foundations' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Customer Feedback/ }),
  ).toBeVisible();
  await expect(page.getByText('5 modules')).toBeVisible();
});

test('day quiz reveals results, saves to the account and unlocks Day 2', async ({
  page,
  user,
}) => {
  await takeAssessment(page, ADVANCED_REDUCED);
  await page.goto('/app/modules/module-3/day1');
  await completeQuiz(page);
  await expect(page.getByText(/\d \/ \d/)).toBeVisible();
  await expect(page.getByText('Day 1 complete')).toBeVisible();
  await page.goto('/app/modules/module-3');
  await expect(
    page.getByRole('link', { name: 'Continue Day 2' }),
  ).toBeVisible();

  const { data } = await admin()
    .from('unit_progress')
    .select('unit_id, status')
    .eq('user_id', user.id);
  expect(data).toEqual([{ unit_id: 'module-3-day1', status: 'completed' }]);
});

test('a full week: Day 2–5 lessons, Build and Practice, then module complete', async ({
  page,
  user,
}) => {
  await takeAssessment(page, ADVANCED_REDUCED);
  await seedCompleted(user.id, unitIds('module-3', [1]));
  for (const day of [2, 3, 4, 5]) {
    await page.goto(`/app/modules/module-3/day${day}`);
    await completeQuiz(page);
  }

  await page.goto('/app/modules/module-3/day6');
  await expect(page.getByText('Protect workplace data')).toBeVisible();
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  const buildChecks = page.getByRole('checkbox');
  for (let index = 0; index < (await buildChecks.count()); index++)
    await buildChecks.nth(index).check();
  await page.getByRole('button', { name: /Complete Build/ }).click();
  // Build complete redirects straight to Day 7 (Practice).
  // Each checkbox tick queues a background save; Complete waits behind them.
  await expect(page).toHaveURL(/module-3\/day7/, { timeout: 20_000 });
  await expect(page.getByText('Make it your own')).toBeVisible();
  await expect(page.getByRole('checkbox').first()).toBeVisible();
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
  // Reduced path is [3,4,5,6], so module 3 is position 1 of 4.
  await expect(page).toHaveURL(/module-3\/day7\/result/, {
    timeout: 20_000,
  });
  await expect(
    page.getByText('Congratulations!', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('You’ve completed Module 1.')).toBeVisible();
  await page.getByRole('link', { name: 'Continue to Module 2' }).click();
  await expect(page).toHaveURL(/module-4/);

  await page.goto('/app/progress');
  await expect(page.getByText('7/7 complete')).toBeVisible();
});

test('completing the last assigned module goes straight to the course-complete screen', async ({
  page,
  user,
}) => {
  await takeAssessment(page, ADVANCED_REDUCED);
  const days = [1, 2, 3, 4, 5, 6, 7];
  await seedCompleted(user.id, [
    ...['module-3', 'module-4', 'module-5'].flatMap((slug) =>
      unitIds(slug, days),
    ),
    ...unitIds('module-6', [1, 2, 3, 4, 5, 6]),
  ]);
  await page.goto('/app/modules/module-6/day7');
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  const ruleChecks = page.getByRole('checkbox');
  for (let index = 0; index < (await ruleChecks.count()); index++)
    await ruleChecks.nth(index).check();
  await page
    .getByPlaceholder('Your reflection')
    .first()
    .fill('Changed the rule set and verified the output myself.');
  await page.getByRole('button', { name: /Complete Practice/ }).click();
  await expect(page).toHaveURL(/course-complete/, { timeout: 20_000 });
  await expect(page.getByText('Congratulations!')).toBeVisible();
  await expect(page.getByText('What do you want to learn next?')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Take me Home' }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test('screen 5a navigation opens every refined destination', async ({
  page,
}) => {
  await takeAssessment(page, ADVANCED_FULL);
  await page.goto('/app');
  await expect(page.getByText('Welcome Tester')).toBeVisible();
  for (const [name, route, heading] of [
    ['Courses', '/app/courses', 'My courses'],
    ['Progress', '/app/progress', 'Progress'],
    ['Build', '/app/build', 'Build it, don’t just read it.'],
    ['Settings', '/app/settings', 'Settings'],
  ] as const) {
    await page
      .getByRole('navigation', { name: 'Primary navigation' })
      .getByRole('link', { name })
      .click();
    await expect(page).toHaveURL(route);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'Home' })
    .click();
  await page.getByRole('link', { name: 'Open notifications' }).click();
  await expect(page).toHaveURL('/app/notifications');
  await expect(
    page.getByRole('heading', { name: 'Notifications' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Close notifications' }).click();
  await expect(page).toHaveURL('/app');
});

test('returning user: log out, sign back in on another device, progress is kept', async ({
  page,
  browser,
  user,
}) => {
  await takeAssessment(page, ADVANCED_REDUCED);
  await page.goto('/app/modules/module-3/day1');
  await completeQuiz(page);

  await page.goto('/app/settings');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/signin/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/signin/);

  // A fresh browser context has no cookies or localStorage — a new device.
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, user);
  await otherPage.goto('/app/progress');
  await expect(otherPage.getByText('1/7 complete')).toBeVisible();
  await otherPage.goto('/app/modules/module-3');
  await expect(
    otherPage.getByRole('link', { name: 'Continue Day 2' }),
  ).toBeVisible();
  await other.close();
});

// Covers the "set a new password" half of the reset flow. The email half
// (forgot-password → link → callback) isn't exercised: it would send real
// mail to a fake address, which bounces and eats the Supabase email quota.
test('password change: new password works, old one does not', async ({
  page,
  browser,
  user,
}) => {
  await page.goto('/reset-password');
  await page.getByLabel('New password').fill('a-brand-new-passw0rd');
  await page.getByRole('button', { name: 'Save new password' }).click();
  await expect(page).toHaveURL(/\/app/);

  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await signIn(otherPage, { ...user, password: 'a-brand-new-passw0rd' });
  await expect(otherPage).toHaveURL(/\/app|\/assessment/);
  await other.close();
});

test('corrupted legacy browser state does not break the app', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('marg-learning-state-v1', '{broken'),
  );
  await page.goto('/app');
  await expect(
    page.getByText('Your practical AI path starts here.'),
  ).toBeVisible();
});

test('duel: play a full 5-question challenge and the result is saved', async ({
  page,
  user,
}) => {
  test.setTimeout(180_000);
  await takeAssessment(page, ADVANCED_REDUCED);
  await seedCompleted(user.id, unitIds('module-3', [1]));
  await page.goto('/app/duels');
  await page.getByText('Start', { exact: true }).click();
  await page.getByRole('button', { name: 'Start challenge' }).click();
  for (let question = 0; question < 5; question++) {
    const option = page.locator('.duel-option').first();
    await expect(option).toBeEnabled({ timeout: 30_000 });
    await option.click();
  }
  await expect(
    page.getByRole('heading', { name: /Victory|Defeat|Draw/ }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/\+\d+ XP/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rematch' })).toBeEnabled({
    timeout: 15_000,
  });

  const { data } = await admin()
    .from('duel_results')
    .select('outcome')
    .eq('user_id', user.id);
  expect(data).toHaveLength(1);
});

test('a failed save tells the learner instead of silently doing nothing', async ({
  page,
}) => {
  await takeAssessment(page, ADVANCED_REDUCED);
  await page.goto('/app/modules/module-3/day1');
  await expect(
    page.getByRole('button', { name: 'Check understanding' }),
  ).toBeVisible();
  // Server actions are POSTs carrying a Next-Action header; failing them
  // simulates the network dropping at the moment the quiz is submitted.
  await page.route('**/*', (route) =>
    route.request().method() === 'POST' &&
    route.request().headers()['next-action']
      ? route.abort()
      : route.continue(),
  );
  await page.getByRole('button', { name: 'Check understanding' }).click();
  for (;;) {
    await page.locator('fieldset label').first().click();
    const next = page.getByRole('button', {
      name: /^(Next|See my results?)$/,
    });
    const label = await next.innerText();
    await next.click();
    if (label.startsWith('See')) break;
  }
  await expect(page.getByText('Couldn’t save your progress.')).toBeVisible();
  await expect(page).not.toHaveURL(/\/result$/);
});

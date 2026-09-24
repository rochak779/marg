import { test as base, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { curriculum } from '@/content/modules';

// The app now requires a signed-in account and keeps all progress in
// Supabase, so every test gets its own throwaway user in the shared project
// (`marg` schema). Users are created pre-confirmed via the admin API — no
// emails are sent — and deleted after the test; every marg table cascades
// from auth.users, so deleting the user removes all of its rows.
export const admin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false }, db: { schema: 'marg' } },
  );

export const TEST_EMAIL_PREFIX = 'marg-e2e+';
export const uniqueEmail = () =>
  `${TEST_EMAIL_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

export type TestUser = { id: string; email: string; password: string };

export async function createUser(firstName = 'Tester'): Promise<TestUser> {
  const email = uniqueEmail();
  const password = 'e2e-Passw0rd!';
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { marg: { first_name: firstName } },
  });
  if (error || !data.user) throw error ?? new Error('createUser failed');
  await admin()
    .from('profiles')
    .insert({ user_id: data.user.id, first_name: firstName });
  return { id: data.user.id, email, password };
}

export async function deleteUser(id: string) {
  await admin().auth.admin.deleteUser(id);
}

export async function signIn(page: Page, user: TestUser) {
  await page.goto('/signin');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Continue learning' }).click();
  await expect(page).not.toHaveURL(/\/signin/);
}

// Answers auto-advance: each tap moves to the next question, and the third
// saves the assessment and opens /recommendation.
export async function takeAssessment(
  page: Page,
  answers: [string, string, string],
) {
  await page.goto('/assessment');
  for (const answer of answers)
    await page.getByRole('button', { name: answer, exact: true }).click();
  await expect(page).toHaveURL(/recommendation/);
}

export const ADVANCED_REDUCED: [string, string, string] = [
  'Yes',
  'Analyse customer feedback or conduct research',
  'Yes',
]; // modules [3, 4, 5, 6]
export const ADVANCED_FULL: [string, string, string] = [
  'Yes',
  'Analyse customer feedback or conduct research',
  'No',
]; // modules [2, 3, 4, 5, 6]
export const BASIC: [string, string, string] = [
  'No',
  'Analyse customer feedback or conduct research',
  'No',
]; // modules [1, 2, 3, 4, 5, 6]

export const unitIds = (moduleSlug: string, days: number[]) =>
  days.map((day) => `${moduleSlug}-day${day}`);

// Marks units complete directly in the DB so a test can start mid-path
// without clicking through every earlier lesson.
export async function seedCompleted(userId: string, ids: string[]) {
  const { data: path } = await admin()
    .from('learning_paths')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  const known = new Set(curriculum.flatMap((m) => m.units.map((u) => u.id)));
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) throw new Error(`Unknown unit ids: ${unknown}`);
  const now = new Date().toISOString();
  const { error } = await admin()
    .from('unit_progress')
    .upsert(
      ids.map((unit_id) => ({
        user_id: userId,
        path_id: path!.id,
        unit_id,
        status: 'completed',
        completed_at: now,
      })),
    );
  if (error) throw error;
}

// Answers every question of an open day quiz (first option each time) and
// lands on the result page.
export async function completeQuiz(page: Page) {
  await page.getByRole('button', { name: 'Check understanding' }).click();
  for (;;) {
    await page.locator('fieldset label').first().click();
    const next = page.getByRole('button', { name: /^(Next|See my results?)$/ });
    const label = await next.innerText();
    await next.click();
    if (label.startsWith('See')) break;
  }
  await expect(page).toHaveURL(/\/result$/);
}

// Every test using this `test` starts with a fresh signed-in user, deleted
// afterwards. Signed-out scenarios live in auth.spec.ts on the base test.
export const test = base.extend<{ user: TestUser }>({
  user: [
    async ({ page }, provide) => {
      const user = await createUser();
      await signIn(page, user);
      await provide(user);
      await deleteUser(user.id);
    },
    { auto: true },
  ],
});
export { expect };

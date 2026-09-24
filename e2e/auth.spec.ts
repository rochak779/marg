import { expect, test } from '@playwright/test';
import { admin, createUser, deleteUser, signIn, uniqueEmail } from './helpers';

// Scenarios that start signed out, so they use the base test rather than
// the signed-in fixture from helpers.ts.

test('signed-out visitors are sent to sign in', async ({ page }) => {
  await page.goto('/app/progress');
  await expect(page).toHaveURL(/\/signin/);
  await expect(page.getByText('Welcome back')).toBeVisible();
});

test('wrong password is rejected with an error', async ({ page }) => {
  const user = await createUser();
  try {
    await signIn(page, { ...user, password: 'not-the-password' }).catch(
      () => {},
    );
    await expect(page).toHaveURL(/\/signin/);
    await expect(
      page.getByText('That email or password isn’t right.'),
    ).toBeVisible();
  } finally {
    await deleteUser(user.id);
  }
});

test('signup creates an account and a profile', async ({ page }) => {
  const email = uniqueEmail();
  await page.goto('/signup');
  await page.getByLabel('Name').fill('Aarav Sharma');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('a-secure-password');
  await page.getByRole('button', { name: 'Create my learning path' }).click();
  // Supabase email confirmation is currently off, so signup signs the user
  // straight in. If it is turned on, the confirm screen shows instead.
  await expect(
    page
      .getByRole('heading', { name: 'Confirm your account to continue.' })
      .or(page.getByText('Your practical AI path starts here.')),
  ).toBeVisible();

  const { data } = await admin().auth.admin.listUsers({ perPage: 1000 });
  const created = data.users.find((u) => u.email === email);
  expect(created).toBeTruthy();
  const { data: profile } = await admin()
    .from('profiles')
    .select('first_name')
    .eq('user_id', created!.id)
    .single();
  expect(profile?.first_name).toBe('Aarav');
  await deleteUser(created!.id);
});

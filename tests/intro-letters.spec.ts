import { test, expect } from '@playwright/test';

test.describe('Intro letters route', () => {
  test('shows gate form for anonymous users', async ({ page }) => {
    await page.goto('/intro-letters');
    await expect(page.getByRole('heading', { name: 'Intro Letters Outreach' })).toBeVisible();
    await expect(page.getByLabel('Gate username')).toBeVisible();
    await expect(page.getByLabel('Gate password')).toBeVisible();
  });

  test('unlocks with valid gate credentials and shows composer', async ({ page }) => {
    await page.goto('/intro-letters');
    await page.getByLabel('Gate username').fill('dimitri.mcdaniel@gmail.com');
    await page.getByLabel('Gate password').fill('1734');
    await page.getByRole('button', { name: 'Unlock' }).click();

    await expect(page.getByRole('button', { name: 'Send intro letters' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lock' })).toBeVisible();
  });
});

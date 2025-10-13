import { test, expect } from '@playwright/test';

// Requires the frontend dev server running and backend API base set.
// Start: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api npm run dev
// In another terminal: npx playwright test

test.describe('Login flow', () => {
  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('nope@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/auth/login')),
      page.getByRole('button', { name: 'Sign in' }).click(),
    ]);
    expect([400, 401, 422, 500]).toContain(resp.status());
  });
});

import { test, expect } from '@playwright/test';

// This test requires:
// - Frontend running at BASE_URL (default http://localhost:3000)
// - Backend reachable and BLOG_TEST_TOKEN env var set to a valid user token with blog add-on
// Run: BASE_URL=http://localhost:3000 BLOG_TEST_TOKEN=... npm run test:ui

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TOKEN = process.env.BLOG_TEST_TOKEN;

test.describe('Blog CRUD', () => {
  test.beforeEach(async ({ context }) => {
    if (!TOKEN) test.skip(true, 'BLOG_TEST_TOKEN not set; skipping blog CRUD tests');
    await context.addCookies([
      {
        name: 'ofroot_token',
        value: TOKEN!,
        url: BASE_URL,
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
  });

  test('can create a post (draft) and auto-redirect to edit', async ({ page }) => {
    if (!TOKEN) test.skip(true, 'BLOG_TEST_TOKEN not set');

    const title = `Playwright Test Post ${Date.now()}`;
    const body = `# Hello\n\nThis is a test post created by Playwright.`;

    await page.goto(`${BASE_URL}/dashboard/blog/new`);

    await page.getByLabel('Title').fill(title);
    await page.getByLabel('Slug').fill(''); // auto-slug
    await page.getByLabel('Excerpt').fill('Created by Playwright');

    // Markdown editor: ensure Write tab is active and fill body
    await page.locator('textarea[name="body"]').fill(body);

    // Status remains draft by default
    await page.getByRole('button', { name: 'Save' }).click();

    // Should redirect to edit page
    await page.waitForURL(/\/dashboard\/blog\/\d+\/edit/);
    await expect(page.getByRole('heading', { name: 'Edit Blog Post' })).toBeVisible();

    // Title should be present in the input
    await expect(page.getByLabel('Title')).toHaveValue(title);

    // Preview tab shows rendered markdown
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByText('Hello')).toBeVisible();
  });
});

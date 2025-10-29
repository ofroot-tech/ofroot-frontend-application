import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TOKEN = process.env.BLOG_TEST_TOKEN;

// This test assumes the create flow works (see blog-crud.spec.ts),
// then publishes and unpublishes and verifies badges in the list.

test.describe('Blog publish/unpublish', () => {
  test.beforeEach(async ({ context }) => {
    if (!TOKEN) test.skip(true, 'BLOG_TEST_TOKEN not set; skipping blog publish tests');
    await context.addCookies([
      { name: 'ofroot_token', value: TOKEN!, url: BASE_URL, path: '/', httpOnly: true, sameSite: 'Lax' },
    ]);
  });

  test('publish then unpublish updates status badges', async ({ page }) => {
    if (!TOKEN) test.skip(true, 'BLOG_TEST_TOKEN not set');

    // Create a draft post quickly
    const title = `PW Publish Test ${Date.now()}`;
    await page.goto(`${BASE_URL}/dashboard/blog/new`);
    await page.getByLabel('Title').fill(title);
    await page.locator('textarea[name="body"]').fill('Body for publish test');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForURL(/\/dashboard\/blog\/\d+\/edit/);

    // Publish from header button
    const publishBtn = page.getByRole('button', { name: 'Publish' });
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Redirect will include ?published=1; then stay on edit page
    await page.waitForURL(/published=1/);
    await expect(page.getByText('Post published')).toBeVisible();

    // Go to list and assert Published pill
    await page.goto(`${BASE_URL}/dashboard/blog`);
    await expect(page.getByText('Published')).toBeVisible();

    // Click back into the new post by title to unpublish
    await page.getByText(title).click(); // this will not navigate unless title is a link; fallback:
    if (!/\/dashboard\/blog\/.+\/edit/.test(page.url())) {
      // Navigate directly if row isn't linked
      const idMatch = await page.locator('table tbody tr').filter({ hasText: title }).first().evaluate(row => row?.getAttribute('data-id'));
      if (idMatch) await page.goto(`${BASE_URL}/dashboard/blog/${idMatch}/edit`);
      else await page.goBack();
    }

    // Unpublish with confirm
    const unpublishBtn = page.getByRole('button', { name: 'Unpublish' });
    await expect(unpublishBtn).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await unpublishBtn.click();
    await page.waitForURL(/unpublished=1/);

    // Back to list and check Draft pill
    await page.goto(`${BASE_URL}/dashboard/blog`);
    await expect(page.getByText('Draft')).toBeVisible();
  });
});

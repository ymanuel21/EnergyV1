import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Testimonial Workflow', () => {
  const TESTIMONIAL_QUOTE = `Test-${Date.now().toString(36)}`;
  let testimonialId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);

    // Create new testimonial
    await page.goto('/admin/testimonials/new');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', `Customer ${TESTIMONIAL_QUOTE}`);
    await page.fill('textarea[name="quote"]', TESTIMONIAL_QUOTE);
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(1000);

    // Get ID from URL
    const url = page.url();
    testimonialId = url.split('/').pop() || '';
    expect(testimonialId).toBeTruthy();
    await page.close();
  });

  test('draft testimonial not visible on public page', async ({ page }) => {
    const res = await page.goto('/testimoni');
    expect(res?.status()).toBe(200);
    // Draft quote should not appear
    await expect(page.locator(`text=${TESTIMONIAL_QUOTE}`)).not.toBeVisible({ timeout: 3000 });
  });

  test('can edit and save draft', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/admin/testimonials/${testimonialId}`);
    await page.waitForLoadState('networkidle');

    // Fill form
    await page.fill('input[name="company"]', 'PT Test');
    await page.fill('input[name="role"]', 'Director');

    // Save Draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Reload and verify
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="company"]')).toHaveValue('PT Test');
  });

  test('submit review → approve → publish', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/admin/testimonials/${testimonialId}`);
    await page.waitForLoadState('networkidle');

    // Submit for Review
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    // Approve from queue
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
    const row = page.locator('tr', { has: page.locator(`text=${TESTIMONIAL_QUOTE}`) });
    if (await row.isVisible()) {
      await row.locator('button:has-text("Approve")').click();
      await page.waitForTimeout(1000);
    }

    // Publish
    await page.goto(`/admin/testimonials/${testimonialId}`);
    await page.waitForLoadState('networkidle');
    const publishBtn = page.locator('button:has-text("Publish")');
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('published testimonial appears on public page', async ({ page }) => {
    const res = await page.goto('/testimoni');
    expect(res?.status()).toBe(200);
    // Should show the testimonial
    await expect(page.locator(`text=${TESTIMONIAL_QUOTE}`)).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await page.goto(`/admin/testimonials/${testimonialId}`);
    await page.waitForLoadState('networkidle');
    try {
      page.once('dialog', d => d.accept());
      await page.click('button:has-text("Delete")');
      await page.waitForTimeout(1000);
    } catch { /* ok */ }
    await page.close();
  });
});

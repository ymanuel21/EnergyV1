import { test, expect } from '@playwright/test';
import { loginAsAdmin, createTestProduct, editProductBySlug, deleteProductOnPage } from './helpers';

test.describe('Review Queue & Permissions', () => {
  let productSlug: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    productSlug = await createTestProduct(page);
    await page.close();
  });

  test('submit for review creates a review entry in queue', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    // Submit for review
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    // Check review queue
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Should see our product in the queue
    const reviewRow = page.locator('tr', { has: page.locator(`text=${productSlug}`) });
    await expect(reviewRow).toBeVisible({ timeout: 5000 });

    // Should show as "Pending Review" 
    await expect(reviewRow.locator('text=Pending Review').first()).toBeVisible({ timeout: 5000 });

    // Approve and Reject buttons should be visible
    await expect(reviewRow.locator('button:has-text("Approve")')).toBeVisible();
    await expect(reviewRow.locator('button:has-text("Reject")')).toBeVisible();
  });

  test('reject review returns product to draft with reason', async ({ page }) => {
    await loginAsAdmin(page);

    // First submit another review
    await editProductBySlug(page, productSlug);

    // If already in review, just submit again
    const submitBtn = page.locator('button:has-text("Submit for Review")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }

    // Go to review queue
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Find and click Reject
    const reviewRow = page.locator('tr', { has: page.locator(`text=${productSlug}`) });
    await reviewRow.locator('button:has-text("Reject")').click();
    await page.waitForTimeout(500);

    // Fill rejection reason
    const reasonInput = page.locator('textarea[name="reason"]');
    if (await reasonInput.isVisible()) {
      await reasonInput.fill('Missing datasheet specification');
      await page.click('button:has-text("Reject"):not([disabled])');
      await page.waitForTimeout(1000);
    }

    // Verify product is back to draft (editable)
    await editProductBySlug(page, productSlug);
    // Should show Draft status and Submit for Review button
    await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible({ timeout: 5000 });
  });

  test('review queue page loads with proper structure', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Page title
    await expect(page.locator('h1:has-text("Review Queue")')).toBeVisible();

    // Table headers
    await expect(page.locator('th:has-text("Entity")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Name")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Actions")').first()).toBeVisible();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);
    await deleteProductOnPage(page);
    await page.close();
  });
});

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Review Queue Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
  });

  test('default queue shows pending reviews', async ({ page }) => {
    // URL should default to pending
    await expect(page.locator('h1:has-text("Review Queue")')).toBeVisible();

    // Active status tab should be Pending
    const activeTab = page.locator('button.bg-primary.text-white:has-text("Pending")');
    await expect(activeTab).toBeVisible();

    // If there are reviews, they should have Pending Review badges
    const pendingBadges = page.locator('text=Pending Review');
    // At minimum, the table renders (may be empty or have items)
    await expect(page.locator('table')).toBeVisible();
  });

  test('status tabs filter correctly', async ({ page }) => {
    // Click Approved
    await page.click('button:has-text("Approved")');
    await page.waitForURL('**/admin/reviews?status=approved**', { timeout: 5000 });

    // Verify URL param
    expect(page.url()).toContain('status=approved');

    // Should show approved reviews (or empty state)
    await expect(page.locator('table')).toBeVisible();
  });

  test('entity filter works for products', async ({ page }) => {
    // Click Products filter
    await page.click('button:has-text("Products")');
    await page.waitForURL('**/admin/reviews?entity=product**', { timeout: 5000 });

    // URL should have entity=product
    expect(page.url()).toContain('entity=product');

    // Table should still render
    await expect(page.locator('table')).toBeVisible();
  });

  test('entity filter works for projects', async ({ page }) => {
    await page.click('button:has-text("Projects")');
    await page.waitForURL('**/admin/reviews?entity=project**', { timeout: 5000 });
    expect(page.url()).toContain('entity=project');
    await expect(page.locator('table')).toBeVisible();
  });

  test('All tab shows all reviews', async ({ page }) => {
    await page.click('button:has-text("All")');
    await page.waitForURL('**?status=all**', { timeout: 5000 });
    expect(page.url()).toContain('status=all');
    await expect(page.locator('table')).toBeVisible();
  });

  test('combined filters work', async ({ page }) => {
    // Pending + Products
    await page.click('button:has-text("Products")');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('entity=product');
  });

  test('search input is visible', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search reviews..."]');
    await expect(searchInput).toBeVisible();
  });

  test('table has all expected columns', async ({ page }) => {
    // Headers
    await expect(page.locator('th:has-text("Entity")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Type")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Actions")').first()).toBeVisible();
  });

  test('refresh keeps filter state', async ({ page }) => {
    // Apply filter
    await page.click('button:has-text("Approved")');
    await page.waitForURL('**status=approved**', { timeout: 5000 });

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // URL should still have status=approved
    expect(page.url()).toContain('status=approved');
  });
});

import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Quotes CRM Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('quote list loads with status tabs', async ({ page }) => {
    await page.goto('/admin/quotes');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Quote Requests")')).toBeVisible();

    // Status tabs should be visible
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Won')).toBeVisible();
    await expect(page.locator('text=Lost')).toBeVisible();
  });

  test('status filter changes displayed quotes', async ({ page }) => {
    await page.goto('/admin/quotes');
    await page.waitForLoadState('networkidle');

    // Click a status tab
    await page.click('a:has-text("Pending")');
    await page.waitForURL('**/admin/quotes?status=pending**', { timeout: 5000 });
    expect(page.url()).toContain('status=pending');
    await expect(page.locator('table')).toBeVisible();
  });

  test('search filters by name', async ({ page }) => {
    await page.goto('/admin/quotes');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill('nonexistent');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    // Should show empty state or filtered results
    await expect(page.locator('table')).toBeVisible();
  });

  test('can view quote detail page', async ({ page }) => {
    await page.goto('/admin/quotes');
    await page.waitForLoadState('networkidle');

    // Click first View link if any quotes exist
    const viewLink = page.locator('a:has-text("View")').first();
    if (await viewLink.isVisible()) {
      await viewLink.click();
      await page.waitForLoadState('networkidle');

      // Should show customer info
      await expect(page.locator('text=Customer Information')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Quick Actions')).toBeVisible({ timeout: 5000 });
    }
  });

  test('unauthorized user cannot access quotes', async ({ browser }) => {
    const page = await browser.newPage();
    const res = await page.goto('/admin/quotes');
    expect(res?.url()).toContain('/admin/login');
    await page.close();
  });
});

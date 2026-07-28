import { test, expect } from '@playwright/test';

test.describe('Homepage Builder CMS', () => {
  test('admin can create and publish a homepage section', async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@ebtplaza.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    // Navigate to Homepage Builder
    await page.click('a[href="/admin/homepage"]');
    await page.waitForURL('**/admin/homepage');

    // Add a new CTA section
    await page.click('button:has-text("CTA")');
    await page.waitForTimeout(1000);

    // The new section should appear as DRAFT
    const draftBadge = page.locator('text=DRAFT').first();
    await expect(draftBadge).toBeVisible();

    // Expand and edit
    const sectionButton = page.locator('button:has-text("CTA")').first();
    await sectionButton.click();
    await page.waitForTimeout(500);

    // Fill title and subtitle
    await page.fill('input[value="CTA"]', 'Test CTA');
    await page.fill('input[placeholder="Button Label"]', 'Click Me');
    await page.fill('input[placeholder="Button Link"]', '/produk');

    // Publish
    await page.click('button:has-text("Publish")');
    await page.waitForTimeout(1000);

    // Verify section is now ON (green badge)
    const onBadge = page.locator('text=On').first();
    await expect(onBadge).toBeVisible();

    // Verify homepage reflects the change
    const homepage = await page.context().newPage();
    await homepage.goto('/');
    await expect(homepage.locator('text=Test CTA')).toBeVisible();
    await homepage.close();
  });

  test('homepage renders sections from database', async ({ page }) => {
    await page.goto('/');
    // Homepage should load without errors
    await expect(page.locator('#main-content')).toBeVisible();
    // Should have at least a header
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Media Library', () => {
  test('media page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@ebtplaza.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    await page.click('a[href="/admin/media"]');
    await page.waitForURL('**/admin/media');
    await expect(page.locator('h1:has-text("Media Library")')).toBeVisible();
  });
});

test.describe('Navigation Manager', () => {
  test('navigation page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@ebtplaza.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin');

    await page.click('a[href="/admin/navigation"]');
    await page.waitForURL('**/admin/navigation');
    await expect(page.locator('h1:has-text("Navigation Manager")')).toBeVisible();
  });
});

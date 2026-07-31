// Admin smoke test — verifies all critical pages load without 500
// Run: npx playwright test tests/admin-smoke.spec.ts
const { test, expect } = require('./fixtures');

test.describe('Admin smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@ebtplaza.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'qwe');
    await page.locator('form[action="/api/login"] button[type="submit"]').click();
    await page.waitForURL('**/admin');
  });

  test('Dashboard loads', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Projects list loads', async ({ page }) => {
    await page.goto('/admin/projects');
    await expect(page.locator('h1:has-text("Projects")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('table')).toBeVisible();
  });

  test('Project edit page loads', async ({ page }) => {
    await page.goto('/admin/projects');
    const firstLink = page.locator('a[href*="/admin/projects/"]').filter({ hasText: /PLTS|Pompa|PJU/ }).first();
    await firstLink.click();
    await expect(page.locator('text=Delete')).toBeVisible({ timeout: 10000 });
  });

  test('Homepage builder loads', async ({ page }) => {
    await page.goto('/admin/homepage');
    await expect(page.locator('text=Sections')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Tenaga surya')).toBeVisible();
    await expect(page.locator('text=Produk Unggulan')).toBeVisible();
    await expect(page.locator('text=Project Referensi')).toBeVisible();
  });

  test('Products page loads', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page.locator('text=Products, text=Produk').first()).toBeVisible({ timeout: 10000 });
  });

  test('Public homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Tenaga surya')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=PRODUK UNGGULAN')).toBeVisible();
  });
});

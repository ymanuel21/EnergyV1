import { test, expect } from '@playwright/test';

async function adminLogin(page) {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || '');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
}

test.describe('Admin Products', () => {
  test('product listing page loads', async ({ page }) => {
    await adminLogin(page);
    await page.click('a[href="/admin/products"]');
    await page.waitForURL('**/admin/products');
    await expect(page.locator('h1')).toContainText('Produk');
  });
});

test.describe('Admin Brands', () => {
  test('brand listing page loads', async ({ page }) => {
    await adminLogin(page);
    await page.click('a[href="/admin/brands"]');
    await page.waitForURL('**/admin/brands');
    await expect(page.locator('h1')).toContainText('Brand');
  });
});

test.describe('Admin Banners', () => {
  test('banner listing page loads', async ({ page }) => {
    await adminLogin(page);
    await page.click('a[href="/admin/banners"]');
    await page.waitForURL('**/admin/banners');
    await expect(page.locator('h1')).toContainText('Banner');
  });
});

test.describe('Admin Appearance', () => {
  test('appearance page loads', async ({ page }) => {
    await adminLogin(page);
    await page.click('a[href="/admin/appearance"]');
    await page.waitForURL('**/admin/appearance');
    await expect(page.locator('h1')).toContainText('Appearance');
  });
});

test.describe('Admin Settings', () => {
  test('settings page loads', async ({ page }) => {
    await adminLogin(page);
    await page.click('a[href="/admin/settings"]');
    await page.waitForURL('**/admin/settings');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('product listing page loads', async ({ page }) => {
    await page.goto('/produk');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('brand page loads', async ({ page }) => {
    await page.goto('/brand');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('search works', async ({ page }) => {
    await page.goto('/cari?q=panel');
    await expect(page.locator('#main-content')).toBeVisible();
  });
});

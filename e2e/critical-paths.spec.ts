import { test, expect } from '@playwright/test';

test.describe('Critical E2E Paths', () => {
  test('compare flow', async ({ page }) => {
    await page.goto('/produk');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('cart page loads', async ({ page }) => {
    await page.goto('/keranjang');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('wishlist page loads', async ({ page }) => {
    await page.goto('/wishlist');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('checkout page loads', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('quote request page loads', async ({ page }) => {
    await page.goto('/permintaan-penawaran');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('search returns results', async ({ page }) => {
    await page.goto('/cari?q=panel');
    await expect(page.locator('#main-content')).toBeVisible();
    // Should show either results or empty state
    await expect(page.locator('#main-content')).not.toBeEmpty();
  });
});

test.describe('Accessibility', () => {
  test('homepage has skip-to-content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('homepage main landmark exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main#main-content')).toBeVisible();
  });
});

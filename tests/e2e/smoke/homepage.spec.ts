import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and renders key sections', async ({ page }) => {
    await page.goto('/');

    // Hero slider exists
    await expect(page.locator('a[href="/produk"], a[href="/afiliasi"]').first()).toBeVisible();

    // Need cards section
    await expect(page.getByText('Mulai dari kebutuhan Anda')).toBeVisible();

    // Clearance section
    await expect(page.getByText('CLEARANCE')).toBeVisible();

    // Promo section
    await expect(page.getByText('PROMO & PENAWARAN')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Click "Lihat Katalog" need card
    await page.getByText('Lihat Katalog').first().click();
    await expect(page).toHaveURL(/\/produk/);
  });

  test('hero slider has indicators', async ({ page }) => {
    await page.goto('/');

    // Counter should show 1/2
    await expect(page.getByText('1/2')).toBeVisible();

    // Two dot buttons
    const dots = page.locator('button[aria-label^="Ke banner"]');
    await expect(dots).toHaveCount(2);
  });

  test('header and footer are present', async ({ page }) => {
    await page.goto('/');

    // Header
    await expect(page.getByLabel('Beranda Energi.Click')).toBeVisible();

    // Footer
    await expect(page.getByText('Energi.Click (by Rekasurya)')).toBeVisible();
  });
});

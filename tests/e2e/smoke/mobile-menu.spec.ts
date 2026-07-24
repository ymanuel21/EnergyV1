import { test, expect } from '@playwright/test';

test.describe('Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

  test('hamburger opens menu, link navigates, menu closes', async ({ page }) => {
    await page.goto('/');

    // Menu should be hidden initially
    const drawer = page.locator('.fixed.inset-y-0.right-0');
    await expect(drawer).not.toBeVisible();

    // Click hamburger
    await page.click('button[aria-label="Buka menu"]');

    // Drawer should slide in
    await expect(drawer).toBeVisible();

    // Should contain navigation links (scoped to drawer)
    await expect(drawer.getByRole('link', { name: 'Semua Produk' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Panel Surya' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'FAQ' }).first()).toBeVisible();

    // Click a category link
    await drawer.getByRole('link', { name: 'Inverter' }).click();

    // Should navigate to category page and menu should close
    await expect(page).toHaveURL(/kategori\/inverter/);
    await expect(drawer).not.toBeVisible();
  });

  test('close button closes menu', async ({ page }) => {
    await page.goto('/');

    // Open menu
    await page.click('button[aria-label="Buka menu"]');
    const drawer = page.locator('.fixed.inset-y-0.right-0');
    await expect(drawer).toBeVisible();

    // Click close (X) button
    await page.click('button[aria-label="Tutup menu"]');
    await expect(drawer).not.toBeVisible();
  });

  test('overlay click closes menu', async ({ page }) => {
    await page.goto('/');

    // Open menu
    await page.click('button[aria-label="Buka menu"]');
    const drawer = page.locator('.fixed.inset-y-0.right-0');
    await expect(drawer).toBeVisible();

    // Click the dark overlay
    await page.locator('.fixed.inset-0.z-50.bg-black\\/40').click();
    await expect(drawer).not.toBeVisible();
  });

  test('Escape key closes menu', async ({ page }) => {
    await page.goto('/');

    // Open menu
    await page.click('button[aria-label="Buka menu"]');
    const drawer = page.locator('.fixed.inset-y-0.right-0');
    await expect(drawer).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });

  test('all utility links in menu are present and clickable', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Buka menu"]');

    // Scope to the drawer to avoid matching footer links
    const drawer = page.locator('.fixed.inset-y-0.right-0');

    const links = [
      'Semua Produk',
      'Promo',
      'Clearance',
      'Afiliator',
      'Bantuan',
    ];

    for (const label of links) {
      await expect(drawer.getByRole('link', { name: label })).toBeVisible();
    }
  });
});

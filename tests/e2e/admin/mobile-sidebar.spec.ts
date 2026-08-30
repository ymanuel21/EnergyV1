import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.use({ viewport: { width: 375, height: 667 } });

/**
 * Regression test for the responsive admin sidebar.
 *
 * On mobile the sidebar must be collapsed off-screen by default, opened via the
 * hamburger button, and closed via the close button (and route change).
 */
test.describe('Admin mobile sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('collapsed by default and opens/closes via controls', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside');
    const openBtn = page.getByRole('button', { name: 'Open menu' });

    // Hamburger button visible; sidebar collapsed off-screen.
    await expect(openBtn).toBeVisible();
    await expect(aside).toHaveClass(/-translate-x-full/);

    // Open the drawer.
    await openBtn.click();
    await expect(aside).not.toHaveClass(/-translate-x-full/);

    // Close via the close button.
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(aside).toHaveClass(/-translate-x-full/);
  });

  test('navigating closes the drawer', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside');

    // Open, then click a nav link — drawer should close after navigation.
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(aside).not.toHaveClass(/-translate-x-full/);

    await page.getByRole('link', { name: 'Quote Requests' }).click();
    await page.waitForURL('**/admin/quotes');
    await expect(aside).toHaveClass(/-translate-x-full/);
  });
});

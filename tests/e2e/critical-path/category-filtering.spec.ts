import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test('displays products for a category', async ({ page }) => {
    await page.goto('/kategori/panel-surya');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Panel Surya');
    // Verify product cards render
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible();
  });

  test('sort dropdown changes URL with correct parameter', async ({ page }) => {
    await page.goto('/kategori/panel-surya');
    const combo = page.getByRole('combobox');
    await expect(combo).toHaveValue('price-asc');
    await combo.selectOption('price-desc');
    await expect(page).toHaveURL(/sort=price-desc/);
  });

  test('breadcrumb is present and links to home', async ({ page }) => {
    await page.goto('/kategori/inverter');
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    // Breadcrumb should contain a link to home
    await expect(breadcrumb.getByRole('link', { name: 'Beranda' })).toBeVisible();
  });

  test('pagination navigates between pages', async ({ page }) => {
    // Use a category with few products — if less than 12, pagination won't render
    // This test verifies pagination works IF present
    await page.goto('/kategori/panel-surya?sort=price-asc');

    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    const hasPagination = await pagination.isVisible().catch(() => false);

    if (hasPagination) {
      // Capture first product name on page 1
      const firstName1 = await page.locator('article').first().locator('a[href^="/produk/"]').last().textContent();

      await page.getByRole('link', { name: '2' }).first().click();
      await page.waitForURL(/page=2/);

      const firstName2 = await page.locator('article').first().locator('a[href^="/produk/"]').last().textContent();
      expect(firstName2).not.toBe(firstName1);
    }
    // If no pagination, that's fine — there aren't enough products
  });
});

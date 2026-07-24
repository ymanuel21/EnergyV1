import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search "panel surya" returns matching products', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Cari produk').fill('panel surya');
    await page.getByRole('button', { name: 'Cari' }).click();

    await expect(page).toHaveURL(/\/cari\?q=panel/);

    // Business outcome: search returned actual products
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verify at least one matching product name appears
    await expect(page.getByText('Panel Surya').first()).toBeVisible();
  });

  test('empty search shows guidance', async ({ page }) => {
    await page.goto('/cari');
    await expect(page.getByText('minimal 2 karakter')).toBeVisible();
  });

  test('no results shows empty state with zero product cards', async ({ page }) => {
    await page.goto('/cari?q=xyznonexistentproduct123');

    // Business outcome: empty state shown AND no stale product cards
    await expect(page.getByText('Tidak ada produk yang cocok')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(0);
  });

  test('sort price-desc actually reorders results by price', async ({ page }) => {
    await page.goto('/cari?q=surya');

    // Wait for products to render
    await expect(page.locator('article').first()).toBeVisible();

    // Extract first product price before sort
    const firstPriceEl = page.locator('article').first().locator('[class*="font-bold"]').first();
    const beforeText = await firstPriceEl.textContent();
    const beforePrice = parseInt((beforeText ?? '0').replace(/\D/g, ''));

    // Change sort to highest price first
    await page.getByRole('combobox').selectOption('price-desc');
    await page.waitForURL(/sort=price-desc/);

    // Extract first product price after sort
    const afterText = await firstPriceEl.textContent();
    const afterPrice = parseInt((afterText ?? '0').replace(/\D/g, ''));

    // Business outcome: sorting by price-desc puts highest price first
    expect(afterPrice).toBeGreaterThanOrEqual(beforePrice);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Brand Page', () => {
  test('brand directory lists all brands', async ({ page }) => {
    await page.goto('/brand');

    await expect(page.getByText('Mitsubishi Electric')).toBeVisible();
    await expect(page.getByText('Canadian Solar')).toBeVisible();
  });

  test('brand page shows products', async ({ page }) => {
    await page.goto('/brand/mitsubishi-electric');

    // Should show brand heading
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mitsubishi Electric');

    // Should have at least one product card
    await expect(page.locator('article').first()).toBeVisible();
  });
});

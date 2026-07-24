import { test, expect } from '@playwright/test';

test.describe('Compare', () => {
  test('displays empty state initially', async ({ page }) => {
    await page.goto('/perbandingan');
    await expect(page.getByText('Belum ada produk yang dibandingkan')).toBeVisible();
  });

  test('add products to compare — table renders with specs', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByTestId('compare-toggle').click();

    await page.goto('/produk/baterai-lithium-pju-12-8v-60ah');
    await page.getByTestId('compare-toggle').click();

    await page.goto('/perbandingan');

    // Business outcome: both products visible in comparison table
    await expect(page.getByText('Mitsubishi Electric')).toBeVisible();
    await expect(page.getByText('Baterai Lithium PJU')).toBeVisible();

    // Spec rows visible
    await expect(page.getByRole('cell', { name: 'Brand', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Kondisi', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Garansi', exact: true })).toBeVisible();
  });

  test('max 4 products enforced', async ({ page }) => {
    const slugs = [
      '/produk/panel-surya-mitsubishi-mje275fb-275wp',
      '/produk/solar-panel-canadian-solar-hiku-440wp',
      '/produk/baterai-lithium-pju-12-8v-60ah',
      '/produk/panel-surya-longi-hi-mo-5-540wp',
      '/produk/bluetti-ac50p-portable-power-station',
    ];

    for (let i = 0; i < 4; i++) {
      await page.goto(slugs[i]);
      await page.getByTestId('compare-toggle').click();
    }

    await page.goto(slugs[4]);
    await page.getByTestId('compare-toggle').click();

    await page.goto('/perbandingan');

    // Business outcome: only 4 products
    await expect(page.getByText('4/4 produk dibandingkan')).toBeVisible();
  });
});

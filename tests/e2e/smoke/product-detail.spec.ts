import { test, expect } from '@playwright/test';

test.describe('Product Detail', () => {
  test('renders product title, price, and specs', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');

    // Product name as heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Mitsubishi');

    // Price should be visible (find currency amounts)
    await expect(page.getByText(/Rp\s*[\d.]+/).first()).toBeVisible();

    // SKU line contains "SKU:" and model info
    await expect(page.getByText('SKU: MITSUBISHI')).toBeVisible({ timeout: 5000 });
  });

  test('tabs switch content', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');

    // Click "Spesifikasi" tab
    await page.getByRole('tab', { name: 'Spesifikasi' }).click();
    await expect(page.getByText('Daya Maksimum')).toBeVisible();

    // Click "Pengiriman & Garansi" tab
    await page.getByRole('tab', { name: /Pengiriman/ }).click();
    await expect(page.getByText('Garansi: 5 Tahun').last()).toBeVisible();
  });

  test('quantity selector works', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');

    const plusButton = page.getByLabel('Tambah jumlah');
    await plusButton.click();
    await plusButton.click();

    // Should show 3 (started at 1, clicked + twice)
    await expect(page.locator('[aria-live="polite"]')).toContainText('3');
  });

  test('add to cart button is present', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await expect(page.getByRole('button', { name: /Tambah ke Keranjang/ })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Cart Persistence & Subtotal', () => {
  test('cart survives page refresh with product, quantity, and subtotal intact', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByLabel('Tambah jumlah').click(); // qty 2
    await page.getByRole('button', { name: /Tambah ke Keranjang/ }).click();
    await page.goto('/keranjang');

    await page.reload();

    // Business outcome: cart survives refresh — product visible
    await expect(page.getByText('Mitsubishi Electric')).toBeVisible({ timeout: 5000 });

    // Subtotal preserved (2 × 1,450,000 = 2,900,000)
    await expect(page.getByText('Rp 2.900.000').first()).toBeVisible();
  });

  test('quantity increment recalculates subtotal correctly', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByRole('button', { name: /Tambah ke Keranjang/ }).click();
    await page.goto('/keranjang');

    await expect(page.getByText('Rp 1.450.000').first()).toBeVisible();

    await page.getByLabel('Tambah jumlah').click();
    await page.getByLabel('Tambah jumlah').click();
    await expect(page.getByText('Rp 4.350.000').first()).toBeVisible();

    await page.getByLabel('Kurangi jumlah').click();
    await page.getByLabel('Kurangi jumlah').click();
    await expect(page.getByText('Rp 1.450.000').first()).toBeVisible();
  });
});

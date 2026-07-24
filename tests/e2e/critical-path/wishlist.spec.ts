import { test, expect } from '@playwright/test';

test.describe('Wishlist', () => {
  test('displays empty state initially', async ({ page }) => {
    await page.goto('/wishlist');
    await expect(page.getByText('Wishlist kosong')).toBeVisible();
  });

  test('wishlist → add to cart flow completes', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByTestId('wishlist-toggle').click();
    await page.goto('/wishlist');

    await expect(page.getByText('Mitsubishi Electric')).toBeVisible();

    // Click "+ Keranjang" specifically (not header cart icon)
    await page.getByRole('button', { name: '+ Keranjang', exact: true }).click();

    await page.goto('/keranjang');

    // Product appears in cart
    await expect(page.getByText('Mitsubishi Electric')).toBeVisible();
    await expect(page.getByText('Rp 1.450.000').first()).toBeVisible();
  });

  test('remove item from wishlist', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByTestId('wishlist-toggle').click();
    await page.goto('/wishlist');

    await expect(page.getByText('Mitsubishi Electric')).toBeVisible();

    // "Hapus" specific button, not "Hapus semua"
    await page.getByRole('button', { name: 'Hapus', exact: true }).click();

    await expect(page.getByText('Wishlist kosong')).toBeVisible();
  });
});

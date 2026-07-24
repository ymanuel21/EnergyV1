import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByRole('button', { name: /Tambah ke Keranjang/ }).click();
  });

  test('shows empty cart state when no items', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/checkout');
    await expect(page.getByText('Keranjang kosong')).toBeVisible();
  });

  test('shipping form validation blocks empty submission', async ({ page }) => {
    await page.goto('/checkout');

    // Listen for alert dialog
    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // Try to advance without filling anything
    await page.getByRole('button', { name: /Lanjutkan/ }).first().click();

    // Business outcome: validation alert appears and blocks progress
    expect(alertMessage).toContain('Mohon isi');

    // Should still be on shipping step
    await expect(page.getByText('Informasi Pengiriman')).toBeVisible();
  });

  test('complete checkout flow to confirmation', async ({ page }) => {
    await page.goto('/checkout');

    // Step 1: Fill shipping
    await page.getByLabel('Nama *').fill('Test Buyer');
    await page.getByLabel('Email *').fill('buyer@test.com');
    await page.getByLabel('Kota *').fill('Bandung');
    await page.getByLabel('Alamat *').fill('Jl. Test No. 123');
    await page.getByRole('button', { name: /Lanjutkan/ }).first().click();

    // Step 2: Payment
    await expect(page.getByText('Metode Pembayaran')).toBeVisible();
    await page.getByText('Transfer Bank').click();
    await page.getByRole('button', { name: /Review Pesanan/ }).click();

    // Step 3: Review
    await expect(page.getByText('Review Pesanan')).toBeVisible();
    await expect(page.getByText('Test Buyer')).toBeVisible();
    await expect(page.getByText('Panel Surya Mitsubishi').first()).toBeVisible();

    // Submit — app opens WhatsApp directly (no alert dialog)
    // Capture the new WhatsApp window/tab
    const waPopupPromise = page.waitForEvent('popup', { timeout: 10000 });
    await page.getByRole('button', { name: /Buat Pesanan/ }).click();

    const waPopup = await waPopupPromise;
    await expect(waPopup).toHaveURL(/whatsapp\.com/);
    await waPopup.close();
  });

  test('checkout step navigation with back button preserves data', async ({ page }) => {
    await page.goto('/checkout');

    await page.getByLabel('Nama *').fill('Test');
    await page.getByLabel('Email *').fill('test@test.com');
    await page.getByLabel('Kota *').fill('Jakarta');
    await page.getByLabel('Alamat *').fill('Jl. Test');

    await page.getByRole('button', { name: /Lanjutkan/ }).first().click();
    await expect(page.getByText('Metode Pembayaran')).toBeVisible();

    // Go back
    await page.getByRole('button', { name: /← Kembali/ }).click();
    await expect(page.getByText('Informasi Pengiriman')).toBeVisible();

    // Data preserved
    await expect(page.getByLabel('Nama *')).toHaveValue('Test');
  });
});

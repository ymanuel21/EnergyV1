import { test, expect } from '@playwright/test';

test.describe('RFQ Submission', () => {
  test('form renders all sections', async ({ page }) => {
    await page.goto('/permintaan-penawaran');
    await expect(page.getByText('Informasi Kontak', { exact: false })).toBeVisible();
    await expect(page.getByText('Detail Proyek', { exact: false })).toBeVisible();
    await expect(page.getByText('Daftar Kebutuhan')).toBeVisible();
  });

  test('validation prevents empty submission', async ({ page }) => {
    await page.goto('/permintaan-penawaran');

    // Wait for client-side hydration
    await page.waitForSelector('button:has-text("Kirim Permintaan")');

    await page.getByRole('button', { name: 'Kirim Permintaan' }).click();

    // Validation errors appear in the form
    await expect(page.getByText('Nama wajib diisi').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Email tidak valid').first()).toBeVisible();
    await expect(page.getByText('Minimal 1 item').first()).toBeVisible();
  });

  test('import from cart populates RFQ items', async ({ page }) => {
    await page.goto('/produk/panel-surya-mitsubishi-mje275fb-275wp');
    await page.getByRole('button', { name: /Tambah ke Keranjang/ }).click();

    await page.goto('/permintaan-penawaran');
    await page.getByRole('button', { name: /Import dari keranjang/ }).click();

    // Business outcome: cart items appear as RFQ items
    await expect(page.getByText('Mitsubishi', { exact: false }).first()).toBeVisible();
  });

  test('valid form proceeds to confirmation with WhatsApp', async ({ page }) => {
    await page.goto('/permintaan-penawaran');
    await page.getByLabel('Nama *').fill('Test User');
    await page.getByLabel('Email *').fill('test@example.com');
    await page.getByPlaceholder('Nama Barang').fill('Panel Surya');
    await page.getByRole('button', { name: /Tambah/ }).click();
    await page.getByRole('button', { name: 'Kirim Permintaan' }).click();

    await expect(page.getByText('Permintaan Terkirim!')).toBeVisible();
    await expect(page.getByText('Test User — test@example.com')).toBeVisible();

    const waButton = page.getByRole('link', { name: /Kirim via WhatsApp/ });
    await expect(waButton).toBeVisible();
    const href = await waButton.getAttribute('href');
    expect(href).toContain('wa.me');
    expect(href).toContain('Panel%20Surya');
  });
});

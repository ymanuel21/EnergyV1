import { test, expect } from '@playwright/test';

test.describe('Article Navigation', () => {
  test('article listing shows articles', async ({ page }) => {
    await page.goto('/artikel');

    await expect(page.getByRole('heading', { name: 'Panduan Energi Surya' })).toBeVisible();
    await expect(page.getByText('4 artikel')).toBeVisible();
  });

  test('article detail renders content', async ({ page }) => {
    await page.goto('/artikel/panduan-memilih-panel-surya');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Panduan Memilih');
    await expect(page.getByText('Monocrystalline')).toBeVisible();
  });

  test('related articles appear at bottom', async ({ page }) => {
    await page.goto('/artikel/panduan-memilih-panel-surya');

    await expect(page.getByText('Artikel Terkait')).toBeVisible();
  });

  test('breadcrumb navigation present', async ({ page }) => {
    await page.goto('/artikel/jenis-jenis-inverter');

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText('Panduan')).toBeVisible();
  });
});

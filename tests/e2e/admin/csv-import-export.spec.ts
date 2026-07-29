import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

const TEST_CSV_VALID = path.resolve(__dirname, 'test-products-valid.csv');
const TEST_CSV_INVALID = path.resolve(__dirname, 'test-products-invalid.csv');

test.describe('CSV Import / Export', () => {
  test.beforeAll(() => {
    // Create valid test CSV
    const slug1 = `csv-test-${Date.now().toString(36)}-a`;
    const slug2 = `csv-test-${Date.now().toString(36)}-b`;
    fs.writeFileSync(TEST_CSV_VALID,
      `name,slug,sku,price,brand,category,description\n` +
      `CSV Product A,${slug1},SKU-A01,2500000,JINKO,Residential,Test import product A\n` +
      `CSV Product B,${slug2},SKU-B02,1800000,JINKO,Residential,Test import product B\n`
    );

    // Create invalid test CSV (missing slug, duplicate slug)
    fs.writeFileSync(TEST_CSV_INVALID,
      `name,slug,sku,price,brand\n` +
      `No Slug Product,,SKU-X,500000,JINKO\n` +
      `Dup Slug,${slug1},SKU-Y,300000,JINKO\n` +
      `Bad Brand,brand-ok,SKU-Z,100000,NonExistentBrand\n`
    );
  });

  test('export CSV downloads a file with product headers', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Click Export CSV
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15000 }),
      page.click('a:has-text("Export CSV")'),
    ]);

    expect(download.suggestedFilename()).toContain('.csv');

    // Read download and verify headers
    const content = await (await download.createReadStream()).toArray();
    const text = Buffer.concat(content).toString();
    expect(text).toContain('name');
    expect(text).toContain('slug');
    expect(text).toContain('price');
    expect(text).toContain('brand');
  });

  test('import valid CSV creates draft products', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Open import modal
    await page.click('button:has-text("Import CSV")');
    await page.waitForTimeout(500);

    // Upload file via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_CSV_VALID);
    await page.waitForTimeout(1000);

    // Should auto-advance to mapping step
    await expect(page.locator('text=Map Columns')).toBeVisible({ timeout: 5000 });

    // Preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=products ready to import')).toBeVisible({ timeout: 5000 });

    // Import
    await page.click('button:has-text("Import")');
    await page.waitForTimeout(2000);

    // Should show results
    await expect(page.locator('text=imported')).toBeVisible({ timeout: 10000 });
  });

  test('invalid CSV shows rejection reasons', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Open import modal
    await page.click('button:has-text("Import CSV")');
    await page.waitForTimeout(500);

    // Upload invalid CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_CSV_INVALID);
    await page.waitForTimeout(1000);

    // Map columns
    await expect(page.locator('text=Map Columns')).toBeVisible({ timeout: 5000 });

    // Preview
    await page.click('button:has-text("Preview")');
    await page.waitForTimeout(500);

    // Import
    await page.click('button:has-text("Import")');
    await page.waitForTimeout(2000);

    // Should show skipped/errors
    await expect(page.locator('text=skipped')).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(() => {
    try { fs.unlinkSync(TEST_CSV_VALID); } catch { /* ok */ }
    try { fs.unlinkSync(TEST_CSV_INVALID); } catch { /* ok */ }
  });
});

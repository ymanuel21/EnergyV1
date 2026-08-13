import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  createTestProduct,
  editProductBySlug,
  deleteProductOnPage,
} from './helpers';

/**
 * Regression tests for the Product Draft → Publish flow.
 *
 * Bug fixed: publishEntity() spread non-column keys (categoryIds, badgeIds,
 * relations, seoTitle, metaDescription) plus `publishedAt` into
 * prisma.product.update(), causing PrismaClientValidationError.
 *
 * These tests require ADMIN_PASSWORD to be set in the environment
 * (e.g. `ADMIN_PASSWORD=... npx playwright test tests/e2e/admin/product-publish.spec.ts`).
 */
test.describe.serial('Product Publish Regression (PRODUCT-PUBLISH)', () => {
  let productSlug: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    productSlug = await createTestProduct(page);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);
    await deleteProductOnPage(page);
    await page.close();
  });

  test('PRODUCT-PUBLISH-001 — scalar fields (model/capacity/sku) survive Draft → Publish', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    await page.fill('input[name="model"]', 'QA-MODEL-001');
    await page.fill('input[name="capacity"]', '10 kW');
    await page.fill('input[name="sku"]', `QA-SKU-${productSlug}`);

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Publish")');
    await page.waitForURL('**/admin/products', { timeout: 15000 });

    // Re-open: values must have survived publish
    await editProductBySlug(page, productSlug);
    await expect(page.locator('input[name="model"]')).toHaveValue('QA-MODEL-001');
    await expect(page.locator('input[name="capacity"]')).toHaveValue('10 kW');
    await expect(page.locator('input[name="sku"]')).toHaveValue(`QA-SKU-${productSlug}`);
  });

  test('PRODUCT-PUBLISH-002 — category change survives Draft → Publish', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    const cat = page.getByRole('checkbox', { name: 'Panel Surya' }).first();
    await cat.check();

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Publish")');
    await page.waitForURL('**/admin/products', { timeout: 15000 });

    await editProductBySlug(page, productSlug);
    await expect(page.getByRole('checkbox', { name: 'Panel Surya' }).first()).toBeChecked();
  });

  test('PRODUCT-PUBLISH-003 — badge change survives Draft → Publish', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    // Media tab → BadgeSelector
    await page.click('button:has-text("Media")');
    const firstBadge = page.locator('label:has(input[type="checkbox"])').first();
    await firstBadge.click();

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Publish")');
    await page.waitForURL('**/admin/products', { timeout: 15000 });

    // Re-open → Media tab → badge should still be selected
    await editProductBySlug(page, productSlug);
    await page.click('button:has-text("Media")');
    await expect(page.locator('label:has(input[type="checkbox"])').first().locator('input')).toBeChecked();
  });

  test('PRODUCT-PUBLISH-004 — related product survives Draft → Publish', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    await page.click('button:has-text("Related")');
    await page.fill('input[placeholder="Type product name..."]', 'panel surya');
    await page.waitForTimeout(1200);
    // Click the ⭐ (recommended) add button on the first result
    const addBtn = page.locator('button:has-text("⭐")').first();
    await addBtn.click();

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Publish")');
    await page.waitForURL('**/admin/products', { timeout: 15000 });

    // Re-open → Related tab → a linked product should be listed
    await editProductBySlug(page, productSlug);
    await page.click('button:has-text("Related")');
    await expect(page.locator('text=Recommended').first()).toBeVisible();
  });

  test('PRODUCT-PUBLISH-005 — publish succeeds with SEO (non-column) fields filled', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    await page.click('button:has-text("SEO")');
    await page.fill('input[name="seoTitle"]', 'QA SEO Title');
    await page.fill('textarea[name="metaDescription"]', 'QA Meta Description');
    await page.click('button:has-text("Overview")');
    await page.fill('input[name="model"]', 'QA-MODEL-002');

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(800);
    await page.click('button:has-text("Publish")');
    // Publish must succeed (no "Gagal" error) and navigate back to products list
    await page.waitForURL('**/admin/products', { timeout: 15000 });

    // Model value persisted; no failure toast
    await editProductBySlug(page, productSlug);
    await expect(page.locator('input[name="model"]')).toHaveValue('QA-MODEL-002');
    await expect(page.locator('text=Gagal mempublikasikan')).not.toBeVisible();
  });
});

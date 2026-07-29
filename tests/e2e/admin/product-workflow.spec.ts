import { test, expect } from '@playwright/test';
import {
  loginAsAdmin,
  createTestProduct,
  editProductBySlug,
  deleteProductOnPage,
  navigateTo,
} from './helpers';

test.describe('Catalog Data Integrity', () => {
  test('restored product opens edit page with specs rendering correctly', async ({ page }) => {
    await loginAsAdmin(page);
    // Navigate to a restored product that had {label,value} specs
    await page.goto('/admin/products/p-restore-ms5tqngz-8');
    // Should load the edit page successfully (not 500)
    await expect(page.locator('text=Edit Produk')).toBeVisible({ timeout: 10000 });
    // Click Specifications tab
    await page.click('text=Specifications');
    // Verify spec rows render with key/value inputs visible
    await expect(page.locator('input[placeholder="e.g. Power"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[placeholder="e.g. 550Wp"]').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Product Workflow: Draft → Review → Approve → Publish', () => {
  let productSlug: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    productSlug = await createTestProduct(page);
    await page.close();
  });

  test('draft product does not appear on public page', async ({ page }) => {
    const res = await page.goto(`/produk/${productSlug}`);
    expect(res?.status()).toBe(404);
  });

  test('save draft isolates changes from public page', async ({ page }) => {
    await loginAsAdmin(page);
    // First publish the product so we have a live version
    await editProductBySlug(page, productSlug);

    // Submit → Approve → Publish
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
    const row = page.locator('tr', { has: page.locator(`text=${productSlug}`) });
    await row.locator('button:has-text("Approve")').click();
    await page.waitForTimeout(1000);

    await editProductBySlug(page, productSlug);
    await page.click('button:has-text("Publish")');
    await page.waitForTimeout(1000);
    await page.waitForURL('**/admin/products', { timeout: 10000 });

    // Verify public page shows current data
    const pub1 = await page.goto(`/produk/${productSlug}`);
    expect(pub1?.status()).toBe(200);

    // Now edit and save draft — public should NOT change
    await editProductBySlug(page, productSlug);
    await page.fill('input[name="name"]', `Draft Title ${productSlug}`);
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Public page should still show the old published title
    const pub2 = await page.goto(`/produk/${productSlug}`);
    expect(pub2?.status()).toBe(200);
    // Draft title should NOT be visible
    const draftTitle = page.locator(`text=Draft Title ${productSlug}`);
    await expect(draftTitle).not.toBeVisible({ timeout: 3000 });

    // Admin should see draft title
    await editProductBySlug(page, productSlug);
    await expect(page.locator('input[name="name"]')).toHaveValue(`Draft Title ${productSlug}`);
  });

  test('editor can save draft and submit for review', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    // Verify status badge shows Draft
    await expect(page.locator('text=Draft').first()).toBeVisible({ timeout: 5000 });

    // Edit a field
    await page.fill('input[name="name"]', `Updated ${productSlug}`);
    await page.fill('textarea[name="description"]', 'Test description for review workflow');

    // Save Draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Reload and verify draft persisted
    await editProductBySlug(page, productSlug);
    await expect(page.locator('input[name="name"]')).toHaveValue(`Updated ${productSlug}`);

    // Submit for Review
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    // Reload — should now show Pending Review
    await editProductBySlug(page, productSlug);
    await expect(page.locator('text=Pending Review').first()).toBeVisible({ timeout: 5000 });
  });

  test('admin can approve review from queue', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Find our product in the review queue
    const row = page.locator('tr', { has: page.locator(`text=${productSlug}`) });
    await expect(row).toBeVisible({ timeout: 5000 });

    // Click Approve
    const approveBtn = row.locator('button:has-text("Approve")');
    await approveBtn.click();
    await page.waitForTimeout(1000);

    // Reload queue — review should show as approved
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
    // The review is now approved, the row may show "Approved by"
  });

  test('approved product can be published', async ({ page }) => {
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);

    // Should show Publish button (after approval)
    const publishBtn = page.locator('button:has-text("Publish")');
    await expect(publishBtn).toBeVisible({ timeout: 5000 });

    // Publish
    await publishBtn.click();
    await page.waitForTimeout(1000);
    await page.waitForURL('**/admin/products', { timeout: 10000 });

    // Reload edit page — should show Published
    await editProductBySlug(page, productSlug);
    await expect(page.locator('text=Published').first()).toBeVisible({ timeout: 5000 });
  });

  test('published product appears on public page', async ({ page }) => {
    const res = await page.goto(`/produk/${productSlug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator(`text=Updated ${productSlug}`)).toBeVisible({ timeout: 10000 });
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await editProductBySlug(page, productSlug);
    await deleteProductOnPage(page);
    await page.close();
  });
});

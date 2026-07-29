import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Product Edit Page Debug — 500 Error', () => {
  test('capture server error on ecoflow-river-3-max-plus', async ({ page }) => {
    // Collect ALL errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`PAGE: ${err.message}`));
    page.on('requestfailed', req => {
      errors.push(`NETWORK: ${req.url()} — ${req.failure()?.errorText}`);
    });

    await loginAsAdmin(page);

    // Navigate to the failing product
    const response = await page.goto('/admin/products/eco-ecoflow-river-3-max-plus-858wh');
    const status = response?.status() || 0;
    console.log(`\n=== RESPONSE STATUS: ${status} ===`);

    // Wait for either success or error
    await page.waitForTimeout(3000);

    // Take screenshot regardless
    await page.screenshot({ path: 'test-results/product-edit-debug.png', fullPage: true });

    // Collect page title and visible text
    const title = await page.title();
    const bodyText = await page.locator('body').innerText();

    console.log('=== PAGE TITLE ===');
    console.log(title);
    console.log('\n=== BODY TEXT (first 500 chars) ===');
    console.log(bodyText.substring(0, 500));
    console.log('\n=== ERRORS ===');
    console.log(errors.join('\n') || 'No errors captured');
    console.log('\n=== URL ===');
    console.log(page.url());

    // If redirected to login, fail gracefully
    if (page.url().includes('/login')) {
      console.log('NOTE: Redirected to login — not authenticated or session expired');
      return;
    }

    // Check for error indicators
    const hasErrorPage = await page.locator('text=This page couldn').isVisible().catch(() => false);
    const hasEditHeading = await page.locator('text=Edit Produk').isVisible().catch(() => false);
    console.log(`\n=== INDICATORS ===`);
    console.log(`Error page visible: ${hasErrorPage}`);
    console.log(`Edit heading visible: ${hasEditHeading}`);

    // Try to detect the error digest if present
    const errorContainer = await page.locator('[data-nextjs-error-code]').getAttribute('data-nextjs-error-code').catch(() => null);
    console.log(`Error digest: ${errorContainer || 'not found'}`);
  });
});

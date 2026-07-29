import { test, expect } from '@playwright/test';

test.describe('500 Error Isolation', () => {
  test('test-form vs products/[id] comparison', async ({ page, request }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().substring(0, 100)); });
    page.on('pageerror', err => errors.push(err.message.substring(0, 100)));

    // Login via API (bypass CSRF/cookie issues)
    const loginRes = await request.post('/api/login', {
      form: { email: 'admin@ebtplaza.com', password: 'qwe' },
      maxRedirects: 0,
    });
    console.log(`Login status: ${loginRes.status()}`);

    // Go to admin after login
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Test 1: test-form
    console.log('\n=== TEST-FORM ===');
    const res1 = await page.goto('/admin/test-form');
    console.log(`Status: ${res1?.status()} | URL: ${page.url()} | Title: ${await page.title()}`);
    const err1 = await page.locator('text=This page couldn').isVisible().catch(() => false);
    console.log(`Error page: ${err1}`);
    if (!err1) {
      const body = await page.locator('body').innerText();
      console.log(`Body preview: ${body.substring(0, 200)}`);
    }

    // Test 2: products/[id]
    console.log('\n=== PRODUCTS/[ID] ===');
    const res2 = await page.goto('/admin/products/eco-ecoflow-river-3-max-plus-858wh');
    console.log(`Status: ${res2?.status()} | URL: ${page.url()} | Title: ${await page.title()}`);
    const err2 = await page.locator('text=This page couldn').isVisible().catch(() => false);
    console.log(`Error page: ${err2}`);
    if (!err2) {
      const body = await page.locator('body').innerText();
      console.log(`Body preview: ${body.substring(0, 200)}`);
    }

    console.log(`\nErrors: ${errors.join(' | ') || 'none'}`);
    await page.screenshot({ path: 'test-results/comparison.png', fullPage: true });
  });
});

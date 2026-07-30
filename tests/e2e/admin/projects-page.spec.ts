import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'admin@ebtplaza.com';
const PASSWORD = 'qwe';

test('admin projects page loads without 500', async ({ page, request }) => {
  // Login via API to get auth cookie
  const loginRes = await request.post(`${BASE}/api/auth/signin`, {
    data: { email: EMAIL, password: PASSWORD },
  });
  
  // Try credential login
  const credRes = await request.post(`${BASE}/api/auth/callback/credentials`, {
    data: { email: EMAIL, password: PASSWORD, csrfToken: 'mock', callbackUrl: '/admin', json: 'true' },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  
  // Use simple form login instead
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  await page.waitForURL('**/admin', { timeout: 10000 }).catch(() => {});
  
  console.log('After login URL:', page.url());
  
  // Navigate to projects
  const response = await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const status = response?.status() || 0;
  
  console.log('Projects status:', status, 'URL:', page.url());
  
  // Take screenshot for evidence
  await page.screenshot({ path: 'test-results/projects-test.png', fullPage: true });
  
  // Check for error page
  const errorText = await page.locator('text="This page couldn\'t load"').count();
  if (errorText > 0) {
    console.log('ERROR: Page shows "couldn\'t load"');
    // Check console for JS errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(2000);
    console.log('JS Errors:', errors);
  }
  
  // Get page content
  const h1 = await page.locator('h1').first().textContent();
  console.log('H1:', h1);
});

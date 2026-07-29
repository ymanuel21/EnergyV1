import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Pre-Deploy Verification', () => {
  test('admin product edit page loads for restored product', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await loginAsAdmin(page);
    await page.goto('/admin/products/p-restore-ms5tqngz-8');
    
    // Must not show error page
    const hasError = await page.locator('text=This page couldn').isVisible().catch(() => false);
    expect(hasError).toBe(false);
    
    // Must show edit heading
    await expect(page.locator('text=Edit Produk')).toBeVisible({ timeout: 10000 });
    
    // Must show product form
    await expect(page.locator('text=Specifications')).toBeVisible({ timeout: 5000 });
    
    // No console errors
    expect(errors.filter(e => !e.includes('favicon') && !e.includes('404'))).toEqual([]);
  });

  test('admin product edit page loads for EcoFlow product', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await loginAsAdmin(page);
    await page.goto('/admin/products/eco-ecoflow-river-3-max-plus-858wh');
    
    const hasError = await page.locator('text=This page couldn').isVisible().catch(() => false);
    expect(hasError).toBe(false);
    await expect(page.locator('text=Edit Produk')).toBeVisible({ timeout: 10000 });
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  });
});

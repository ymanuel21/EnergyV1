import { test, expect } from '@playwright/test';

test.describe('FAQ', () => {
  test('page loads with FAQ items', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByText('FAQ (Help)')).toBeVisible();
  });

  test('accordion expands and collapses content', async ({ page }) => {
    await page.goto('/faq');

    const firstQuestion = page.getByText('How do I buy a product').first();
    await firstQuestion.click();
    await expect(page.getByText('Choose the product you want')).toBeVisible({ timeout: 3000 });

    await firstQuestion.click();
    await expect(page.getByText('Choose the product you want')).not.toBeVisible({ timeout: 3000 });
  });

  test('contact CTAs link correctly', async ({ page }) => {
    await page.goto('/faq');

    // WhatsApp link in the contact CTA section (not floating button)
    const waLink = page.locator('.rounded-lg.bg-green-500').filter({ hasText: 'WhatsApp' }).first();
    await expect(waLink).toBeVisible();
    const href = await waLink.getAttribute('href');
    expect(href).toContain('wa.me');

    // "Ajukan Pertanyaan" links to RFQ
    const rfqLink = page.getByRole('link', { name: 'Ask a Question' });
    await expect(rfqLink).toBeVisible();
  });
});

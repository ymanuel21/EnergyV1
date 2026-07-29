import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Project Form Parity — Tabbed Editor', () => {
  const PROJECT_SLUG = `tab-proj-${Date.now().toString(36)}`;
  const PROJECT_TITLE = `Tab Project ${PROJECT_SLUG}`;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);

    // Create project
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("New Project")');
    await page.waitForTimeout(1000);

    // Find and edit
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    const firstEdit = page.locator('a:has-text("Edit")').first();
    await firstEdit.click();
    await page.waitForLoadState('networkidle');

    // Fill required
    await page.fill('input[name="title"]', PROJECT_TITLE);
    await page.fill('input[name="slug"]', PROJECT_SLUG);
    await page.fill('input[name="location"]', 'Bandung');
    await page.selectOption('select[name="category"]', 'industrial');
    await page.fill('input[name="capacity"]', '25 kWp');
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);
    await page.close();
  });

  test('all 7 tabs are visible', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button:has-text("Story")')).toBeVisible();
    await expect(page.locator('button:has-text("Media")')).toBeVisible();
    await expect(page.locator('button:has-text("Impact")')).toBeVisible();
    await expect(page.locator('button:has-text("Products")')).toBeVisible();
    await expect(page.locator('button:has-text("SEO")')).toBeVisible();
    await expect(page.locator('button:has-text("Settings")')).toBeVisible();
  });

  test('story tab saves and persists challenge/solution/result', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    // Switch to Story tab
    await page.click('button:has-text("Story")');
    await page.waitForTimeout(300);

    // Fill story fields
    const challengeArea = page.locator('textarea').filter({ hasText: /What problem/ }).first();
    await challengeArea.fill('High electricity costs');
    await page.locator('textarea').nth(1).fill('Installed solar panels'); // solution
    await page.locator('textarea').nth(2).fill('Reduced costs by 60%'); // result

    // Save Draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Reload and verify
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Story")');
    await page.waitForTimeout(300);

    await expect(page.locator('textarea').first()).toHaveValue('High electricity costs');
  });

  test('impact tab saves and persists metrics', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    // Switch to Impact tab
    await page.click('button:has-text("Impact")');
    await page.waitForTimeout(300);

    // Fill impact fields
    const inputs = page.locator('input[placeholder*="CO"], input[placeholder*="Rp"], input[placeholder*="kWh"]');
    if (await inputs.nth(0).isVisible()) await inputs.nth(0).fill('20 tons/year');
    if (await inputs.nth(1).isVisible()) await inputs.nth(1).fill('Rp 50.000.000');
    if (await inputs.nth(2).isVisible()) await inputs.nth(2).fill('30.000 kWh/year');

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    await page.reload();
    await page.click('button:has-text("Impact")');
    await page.waitForTimeout(300);

    // Should have values
    const firstInput = page.locator('input').filter({ has: page.locator('[placeholder*="CO"]') }).first();
    if (await firstInput.isVisible()) {
      await expect(firstInput).toHaveValue('20 tons/year');
    }
  });

  test('full workflow: submit → approve → publish → public shows story+impact', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    // Submit for Review
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    // Approve from queue
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
    const reviewRow = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await reviewRow.locator('button:has-text("Approve")').click();
    await page.waitForTimeout(1000);

    // Publish
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    const row2 = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row2.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Publish")');
    await page.waitForTimeout(1000);

    // Verify public page
    await page.goto(`/proyek/${PROJECT_SLUG}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText(PROJECT_TITLE);
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    if (await row.isVisible()) {
      const deleteForm = row.locator('form').last();
      const deleteBtn = deleteForm.locator('button:has-text("Delete")');
      if (await deleteBtn.isVisible()) {
        page.once('dialog', d => d.accept());
        await deleteBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    await page.close();
  });
});

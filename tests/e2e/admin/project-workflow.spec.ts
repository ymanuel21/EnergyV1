import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Project Workflow: Draft → Review → Approve → Publish', () => {
  const PROJECT_SLUG = `test-proj-${Date.now().toString(36)}`;
  const PROJECT_TITLE = `Test Project ${PROJECT_SLUG}`;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);

    // Create a new project via the server action
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("New Project")');
    await page.waitForTimeout(1000);

    // Find and edit the new project
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');
    const firstEdit = page.locator('a:has-text("Edit")').first();
    await firstEdit.click();
    await page.waitForLoadState('networkidle');

    // Fill fields
    await page.fill('input[name="title"]', PROJECT_TITLE);
    await page.fill('input[name="slug"]', PROJECT_SLUG);
    await page.fill('input[name="location"]', 'Jakarta');
    await page.selectOption('select[name="category"]', 'commercial');

    // Save Draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    await page.close();
  });

  test('draft project not visible on public page', async ({ page }) => {
    const res = await page.goto(`/proyek/${PROJECT_SLUG}`);
    expect(res?.status()).toBe(404);
  });

  test('project shows draft status and can submit for review', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    // Find and edit our project
    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    // Verify Draft status badge
    await expect(page.locator('text=Draft').first()).toBeVisible({ timeout: 5000 });

    // Submit for Review
    await page.click('button:has-text("Submit for Review")');
    await page.waitForTimeout(1000);

    // Reload — should show Pending Review
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Pending Review').first()).toBeVisible({ timeout: 5000 });
  });

  test('admin can approve project review from queue', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Find project in review queue (entityType = project)
    const projectRow = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await expect(projectRow).toBeVisible({ timeout: 5000 });

    // Approve
    await projectRow.locator('button:has-text("Approve")').click();
    await page.waitForTimeout(1000);
  });

  test('approved project can publish and appears on public page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { has: page.locator(`text=${PROJECT_TITLE}`) });
    await row.locator('a:has-text("Edit")').click();
    await page.waitForLoadState('networkidle');

    // Publish
    const publishBtn = page.locator('button:has-text("Publish")');
    await expect(publishBtn).toBeVisible({ timeout: 5000 });
    await publishBtn.click();
    await page.waitForTimeout(1000);
    await page.waitForURL('**/admin/projects', { timeout: 10000 });

    // Verify on public projects list
    await page.goto('/proyek');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${PROJECT_TITLE}`).first()).toBeVisible({ timeout: 10000 });

    // Verify on project detail page
    await page.goto(`/proyek/${PROJECT_SLUG}`);
    expect(page.url()).toContain(PROJECT_SLUG);
    await expect(page.locator('h1')).toContainText(PROJECT_TITLE);
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    // Find and delete
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

import { Page, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ebtplaza.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

/**
 * Login to the admin panel. Reuses existing session if already logged in.
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');

  // If already logged in (redirected to /admin), skip login
  if (page.url().includes('/admin') && !page.url().includes('/login')) {
    return;
  }

  await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });
}

/**
 * Navigate to a specific admin page via sidebar link.
 */
export async function navigateTo(page: Page, label: string, href?: string) {
  if (href) {
    await page.click(`a[href="${href}"]`);
  } else {
    await page.click(`a:has-text("${label}")`);
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Create a test product via the admin UI. Returns the product slug.
 */
export async function createTestProduct(page: Page): Promise<string> {
  const slug = `test-product-${Date.now().toString(36)}`;
  await page.goto('/admin/products/new');
  await page.waitForSelector('input[name="name"]', { timeout: 5000 });

  await page.fill('input[name="name"]', `Test Product ${slug}`);
  const slugInput = page.locator('input[name="slug"]');
  await slugInput.fill(slug);

  // Select first brand
  const brandSelect = page.locator('select[name="brandId"]');
  const brandOptions = await brandSelect.locator('option').all();
  if (brandOptions.length > 1) {
    await brandSelect.selectOption({ index: 1 });
  }

  await page.fill('input[name="price"]', '1000000');
  await page.fill('input[name="stock"]', '10');

  // Click Save Draft (the primary button when creating)
  await page.click('button:has-text("Save Draft"), button[type="submit"]:has-text("Save")');
  await page.waitForTimeout(1000);

  return slug;
}

/**
 * Navigate to edit a product by slug (must be on admin products page).
 * Clicks the first matching Edit link.
 */
export async function editProductBySlug(page: Page, slug: string) {
  await page.goto('/admin/products');
  await page.waitForLoadState('networkidle');

  // Find the row with our slug and click Edit
  const row = page.locator('tr', { has: page.locator(`text=${slug}`) });
  const editLink = row.locator('a:has-text("Edit"), a[href*="/admin/products/"]').first();
  await editLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Delete a product via the edit page delete button.
 */
export async function deleteProductOnPage(page: Page) {
  const deleteBtn = page.locator('button:has-text("Hapus"), button:has-text("Delete")').first();
  if (await deleteBtn.isVisible()) {
    // Handle browser confirm dialog
    page.once('dialog', d => d.accept());
    await deleteBtn.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Create a test project via the admin UI.
 */
export async function createTestProject(page: Page): Promise<string> {
  const slug = `test-project-${Date.now().toString(36)}`;
  await page.goto('/admin/projects');
  await page.waitForLoadState('networkidle');

  // Click + New Project (server action form)
  await page.click('button:has-text("New Project")');
  await page.waitForTimeout(1000);

  // Navigate to edit — find the newly created project
  await page.goto('/admin/projects');
  await page.waitForLoadState('networkidle');

  // Click Edit on the newest (first) project
  const firstEdit = page.locator('a:has-text("Edit")').first();
  await firstEdit.click();
  await page.waitForLoadState('networkidle');

  // Fill required fields
  await page.fill('input[name="title"]', `Test Project ${slug}`);
  await page.fill('input[name="slug"]', slug);
  await page.fill('input[name="location"]', 'Jakarta');

  // Save Draft
  await page.click('button:has-text("Save Draft")');
  await page.waitForTimeout(1000);

  return slug;
}

/**
 * Open the review queue page.
 */
export async function openReviewQueue(page: Page) {
  await page.goto('/admin/reviews');
  await page.waitForLoadState('networkidle');
}

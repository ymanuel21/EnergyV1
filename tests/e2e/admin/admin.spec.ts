import { test, expect } from '@playwright/test';

async function login(page: any) {
  await page.goto('/admin/login');
  await page.waitForSelector('button:has-text("Masuk")');
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForURL('**/admin', { timeout: 15000 });
}

// ─── Auth ────────────────────────────────────────────────────

test('unauthenticated redirects to login', async ({ page }) => {
  const res = await page.goto('/admin');
  expect(res?.url()).toContain('/admin/login');
});

test('invalid creds show error', async ({ page }) => {
  await page.goto('/admin/login');
  await page.waitForSelector('button:has-text("Masuk")');
  await page.fill('input[name="email"]', 'wrong@test.com');
  await page.fill('input[name="password"]', 'wrong');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await expect(page.getByText('Email atau password salah')).toBeVisible({ timeout: 10000 });
});

test('valid login redirects to dashboard', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('logout redirects to login', async ({ page }) => {
  await login(page);
  await page.click('button:has-text("Logout")');
  await page.waitForURL('**/login**', { timeout: 10000 });
  await expect(page.url()).toContain('/login');
});

test('dashboard shows Quick Actions', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Quick Actions')).toBeVisible();
});

// ─── Sidebar Navigation ──────────────────────────────────────

test('sidebar navigates to Produk', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Produk")');
  await expect(page.getByRole('heading', { name: 'Produk' })).toBeVisible({ timeout: 5000 });
});

test('sidebar navigates to Kategori', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Kategori")');
  await expect(page.getByRole('heading', { name: 'Kategori' })).toBeVisible({ timeout: 5000 });
});

test('sidebar navigates to Brand', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Brand")');
  await expect(page.getByRole('heading', { name: 'Brand' })).toBeVisible({ timeout: 5000 });
});

test('sidebar navigates to FAQ', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("FAQ")');
  await expect(page.getByRole('heading', { name: 'FAQ' })).toBeVisible({ timeout: 5000 });
});

test('sidebar navigates to Banner', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Banner")');
  await expect(page.getByRole('heading', { name: 'Banner' })).toBeVisible({ timeout: 5000 });
});

test('sidebar navigates to Pengaturan', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Pengaturan")');
  await expect(page.getByRole('heading', { name: 'Pengaturan' })).toBeVisible({ timeout: 5000 });
});

// ─── CRUD ────────────────────────────────────────────────────

test('banners page shows content', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("Banner")');
  await expect(page.getByText('Tambah Banner')).toBeVisible({ timeout: 5000 });
});

test('faq page shows items', async ({ page }) => {
  await login(page);
  await page.click('a:has-text("FAQ")');
  await expect(page.getByText('Tambah FAQ')).toBeVisible({ timeout: 5000 });
});

import { test, expect } from '@playwright/test';
import { Pool } from 'pg';
import 'dotenv/config';

const BASE = 'http://localhost:3000';
const DB = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

test('Homepage Publish writes settings to DB', async ({ page }) => {
  // Login
  await page.goto(`${BASE}/admin/login`);
  await page.locator('input[name="email"]').fill('admin@ebtplaza.com');
  await page.locator('input[name="password"]').fill('qwe');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL('**/admin', { timeout: 10000 }).catch(() => {});
  
  if (page.url().includes('/login')) {
    console.log('Login failed');
    return;
  }

  // Navigate to homepage CMS
  await page.goto(`${BASE}/admin/homepage`, { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Homepage URL:', page.url());

  // Click on "Featured Products" section to open it
  await page.locator('text=Featured Products').first().click();
  await page.waitForTimeout(2000);

  // Check DB BEFORE
  const before = await DB.query(`
    SELECT hsv.status, settings 
    FROM homepage_section_versions hsv 
    JOIN homepage_sections hs ON hsv."sectionId" = hs.id 
    WHERE hs.type = 'featured-products' AND hs.enabled = true
  `);
  for (const r of before.rows) {
    console.log('BEFORE', r.status, JSON.stringify(r.settings).substring(0,80));
  }

  // Click Publish
  const publishBtn = page.locator('button:has-text("Publish")').first();
  await publishBtn.click();
  await page.waitForTimeout(3000);

  // Check DB AFTER
  const after = await DB.query(`
    SELECT hsv.status, settings 
    FROM homepage_section_versions hsv 
    JOIN homepage_sections hs ON hsv."sectionId" = hs.id 
    WHERE hs.type = 'featured-products' AND hs.enabled = true
  `);
  for (const r of after.rows) {
    console.log('AFTER', r.status, JSON.stringify(r.settings).substring(0,80));
  }

  // Verify published settings are NOT empty
  const pubAfter = after.rows.find(r => r.status === 'published');
  if (!pubAfter) {
    console.log('FAIL: No published record after publish!');
  } else {
    const s = typeof pubAfter.settings === 'string' ? JSON.parse(pubAfter.settings) : pubAfter.settings;
    const isEmpty = !s || Object.keys(s).length === 0;
    if (isEmpty) {
      console.log('FAIL: Published settings still empty after publish click!');
    } else {
      console.log('PASS: Published settings:', JSON.stringify(s).substring(0,100));
    }
  }

  await DB.end();
});

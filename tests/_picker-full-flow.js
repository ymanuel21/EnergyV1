const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 100 });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Produk Unggulan
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // Find Save/Publish and Content/Style tabs
  const saveCount = await page.locator('button:has-text("Save")').count();
  const pubCount = await page.locator('button:has-text("Publish")').count();
  console.log('1. Save:', saveCount, 'Pub:', pubCount);

  if (pubCount > 0) {
    // Product already selected (EcoFlow 160W) — just publish
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(4000);
    console.log('2. ✅ Published');
  } else {
    // Click Content tab to show product picker
    const contentTab = page.locator('button:has-text("Content")').first();
    if (await contentTab.isVisible().catch(() => false)) {
      await contentTab.click();
      await page.waitForTimeout(1000);
      console.log('2. Content tab opened');
    }
    
    // Check product picker
    const picker = page.locator('input[placeholder*="Cari"]').first();
    if (await picker.isVisible().catch(() => false)) {
      console.log('3. Picker found');
    }
  }

  // Verify public homepage
  await page.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const hasEco = (await page.content()).includes('EcoFlow 160W');
  console.log('4. Public has EcoFlow:', hasEco);

  await browser.close();
  console.log('DONE');
})();

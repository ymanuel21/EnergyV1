const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click to open editor
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // Use ProductPicker inside the editor panel (not the header)
  const picker = page.locator('input[placeholder="Cari produk..."]').first();
  await picker.click();
  await picker.fill('eco');
  await page.waitForTimeout(2000);
  console.log('1. Typed eco');

  // Select from dropdown - use button inside absolute div, not a link
  const dropdownBtn = page.locator('.absolute button.w-full').first();
  const btnVis = await dropdownBtn.isVisible().catch(() => false);
  console.log('2. Dropdown visible:', btnVis);
  
  if (btnVis) {
    // Use dispatchEvent to prevent navigation
    await dropdownBtn.dispatchEvent('click');
    await page.waitForTimeout(2000);
    console.log('3. Selected');
    
    // Check URL hasn't changed
    const url = page.url();
    console.log('4. URL:', url.includes('/homepage') ? 'OK' : 'NAVIGATED AWAY');
  }

  await page.waitForTimeout(1000);

  // Check Save/Publish
  const saveCount = await page.locator('button:has-text("Save Draft")').count();
  const pubCount = await page.locator('button:has-text("Publish")').count();
  console.log('5. Save:', saveCount, 'Publish:', pubCount);

  if (pubCount > 0) {
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(3000);
    console.log('6. ✅ Published');
  }

  // Public homepage
  await page.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const hasEco = (await page.content()).includes('EcoFlow 160W');
  console.log('7. Public:', hasEco);

  await browser.close();
})();

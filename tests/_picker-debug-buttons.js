const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForURL('**/admin', { timeout: 10000 });

  // Homepage builder
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click Produk Unggulan
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // DUMP all visible buttons for debugging
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b => ({
      text: b.textContent?.trim().substring(0, 30),
      cls: b.className.substring(0, 50)
    }));
  });
  console.log('Buttons visible:', JSON.stringify(buttons, null, 1));

  // Check for any button containing Save/Publish
  const saveBtn = page.locator('button:has-text("Save")').first();
  const pubBtn = page.locator('button:has-text("Publish")').first();
  console.log('Save visible:', await saveBtn.isVisible().catch(() => false));
  console.log('Publish visible:', await pubBtn.isVisible().catch(() => false));

  // Check if there's a right panel by looking at the DOM structure
  const hasAside = await page.locator('aside').count();
  console.log('Aside panels:', hasAside);

  await browser.close();
})();

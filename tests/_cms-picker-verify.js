const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // Track API calls
  var apiCalled = false;
  page.on('request', function(r) {
    if (r.url().indexOf('search-products') >= 0) {
      apiCalled = true;
      console.log('API CALLED:', r.url().substring(30));
    }
  });
  page.on('response', function(r) {
    if (r.url().indexOf('search-products') >= 0) {
      console.log('API RESP:', r.status(), r.url().substring(30));
    }
  });

  // Type in picker
  var picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
  if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await picker.click();
    // Type character by character to ensure input event fires
    await picker.fill('eco');
    await page.waitForTimeout(3000);
    
    console.log('API was called:', apiCalled);

    if (!apiCalled) {
      // Try typing with keyboard
      await picker.press('Backspace');
      await picker.press('Backspace');
      await picker.press('Backspace');
      await picker.type('eco', { delay: 100 });
      await page.waitForTimeout(3000);
      console.log('After retype — API was called:', apiCalled);
    }
  }

  await browser.close();
})();

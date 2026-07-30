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

  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  const picker = page.locator('input[placeholder="Cari produk..."]').first();
  await picker.click();
  await picker.fill('eco');
  await page.waitForTimeout(2000);

  // Use evaluate to click and capture navigation URL
  const navResult = await page.evaluate(() => {
    const btns = document.querySelectorAll('.absolute button.w-full');
    if (btns.length > 0) {
      btns[0].click();
      // Return immediately after click
      return 'clicked';
    }
    return 'no buttons';
  });
  console.log('Click:', navResult);

  // Wait and check where we are
  await page.waitForTimeout(3000);
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  console.log('Destination:', finalUrl.includes('/produk/') ? 'PRODUCT PAGE' : finalUrl.includes('/homepage') ? 'HOMEPAGE' : finalUrl.includes('/admin') ? 'ADMIN' : 'OTHER');

  await browser.close();
})();

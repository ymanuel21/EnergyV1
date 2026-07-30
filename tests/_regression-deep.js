const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', function(msg) {
    if (msg.type() === 'error') console.log('ERR:', msg.text().substring(0, 120));
  });
  page.on('pageerror', function(err) { console.log('PAGE:', err.message.substring(0, 150)); });

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);

  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Check what's actually in the body
  var bodyText = await page.evaluate(function() {
    return document.body.innerText.substring(0, 500);
  });
  console.log('BODY:', bodyText);

  // Check for RSC error digest
  var htmlContent = await page.content();
  var hasDigest = htmlContent.includes('digest');
  console.log('Has digest:', hasDigest);

  await browser.close();
})();

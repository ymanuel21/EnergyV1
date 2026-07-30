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

  // Capture console errors
  var reactErrors = [];
  page.on('console', function(msg) {
    if (msg.type() === 'error') reactErrors.push(msg.text().substring(0, 150));
  });
  page.on('pageerror', function(err) { reactErrors.push('PAGE: ' + err.message.substring(0, 150)); });

  // Open Produk Unggulan
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // Type in Featured Product field
  var picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
  if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await picker.click();
    await picker.fill('eco');
    await page.waitForTimeout(3000);

    // Check dropdown
    var count = await page.evaluate(function() {
      var btns = document.querySelectorAll('.absolute button.w-full');
      return btns.length;
    });
    console.log('Dropdown items:', count);

    // Check errors
    console.log('React errors:', reactErrors.length, reactErrors.join(' | ').substring(0, 200));

    // Wait 15 seconds for delayed crash
    for (var i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      var crashed = (await page.content()).indexOf('server error') > 0;
      if (crashed) {
        console.log('CRASH at t=' + i + 's');
        break;
      }
    }
    if (!crashed) console.log('No crash after 15s');

    // Select first result
    if (count > 0) {
      await page.evaluate(function() { document.querySelectorAll('.absolute button.w-full')[0].click(); });
      await page.waitForTimeout(2000);
      console.log('After select — errors:', reactErrors.length);
      console.log('Still on page:', page.url().indexOf('/homepage') > 0);
    }
  } else {
    console.log('Picker not found');
  }

  await browser.close();
})();

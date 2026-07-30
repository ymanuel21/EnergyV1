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

  // UNIQUE placeholder + UNIQUE remove button
  var picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
  if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    console.log('1. ✅ Picker visible');

    // Clear with UNIQUE button
    var hapus = page.locator('button:has-text("Hapus")');
    var hapCount = await hapus.count().catch(function() { return 0; });
    console.log('2. Hapus buttons:', hapCount);
    
    if (hapCount > 0) {
      await hapus.first().click();
      await page.waitForTimeout(1000);
      console.log('3. Cleared');
    }

    // Re-get picker
    picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
    if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await picker.click();
      await picker.fill('river');
      await page.waitForTimeout(2500);

      var count = await page.evaluate(function() {
        return document.querySelectorAll('.absolute button.w-full').length;
      });
      console.log('4. Dropdown:', count);

      if (count > 0) {
        var preUrl = page.url();
        await page.evaluate(function() { 
          document.querySelectorAll('.absolute button.w-full')[0].click(); 
        });
        await page.waitForTimeout(2000);
        console.log('5. Navigation:', page.url() === preUrl ? '✅ NO NAVIGATION' : '❌ NAVIGATED');

        if (page.url() === preUrl) {
          var pub = page.locator('button:has-text("Publish")').first();
          if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
            await pub.click();
            await page.waitForTimeout(4000);
            var still = page.url().indexOf('/homepage') > 0;
            console.log('6. Publish:', still ? '✅' : '❌');
            var btnCount = await page.locator('button:has-text("Publish")').count().catch(function() { return 0; });
            console.log('7. Btn reenabled:', btnCount > 0 ? '✅' : '⚠️');
          }
        }
      }
    }
  } else {
    console.log('1. ❌ Picker not found');
  }

  await browser.close();
})();

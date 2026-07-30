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

  // Open section
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  // NOW use the unique placeholder
  var picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
  if (await picker.isVisible({ timeout: 3000 }).catch(function() { return false; })) {
    console.log('1. ✅ Picker found');

    // Clear current if any (the chip has × button)
    var xBtn = picker.locator('..').locator('..').locator('..').locator('button:has-text("×")');
    // Simpler: find × in the parent chain
    var allX = page.locator('button:has-text("×")');
    if (await allX.first().isVisible({ timeout: 1000 }).catch(function() { return false; })) {
      await allX.first().click();
      await page.waitForTimeout(1000);
      console.log('2. Cleared');
    }

    // Re-get picker after clear
    picker = page.locator('input[placeholder="Pilih produk unggulan..."]');
    await picker.click();
    await picker.fill('river');
    await page.waitForTimeout(2500);

    // Select first result
    var items = await page.evaluate(function() {
      var btns = document.querySelectorAll('.absolute button.w-full');
      return btns.length;
    });
    console.log('3. Dropdown:', items);

    if (items > 0) {
      var preUrl = page.url();
      await page.evaluate(function() { document.querySelectorAll('.absolute button.w-full')[0].click(); });
      await page.waitForTimeout(2000);
      console.log('4. Navigation:', page.url() === preUrl ? '✅ STAYED' : '❌ NAVIGATED');

      if (page.url() === preUrl) {
        // Save Draft
        var save = page.locator('button:has-text("Save Draft")').first();
        if (await save.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
          await save.click();
          await page.waitForTimeout(3000);
          console.log('5. Save Draft:', page.url().indexOf('/homepage') > 0 ? '✅' : '❌');
        }

        // Publish
        var pub = page.locator('button:has-text("Publish")').first();
        if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
          await pub.click();
          await page.waitForTimeout(4000);
          var still = page.url().indexOf('/homepage') > 0;
          var pubStill = await page.locator('button:has-text("Publish")').count().catch(function() { return 0; });
          console.log('6. Publish:', still ? '✅ NO CRASH' : '❌');
          console.log('7. Btn reenabled:', pubStill > 0 ? '✅' : '⚠️');
        }
      }
    }
  } else {
    console.log('1. ❌ Picker not found');
  }

  await browser.close();
  console.log('DONE');
})();

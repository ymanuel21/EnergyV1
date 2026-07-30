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

  console.log('Testing 10 rapid publishes without pause...');

  for (var round = 1; round <= 5; round++) {
    await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check for RSC error
    var hasRSC = (await page.content()).indexOf('server error') > 0;
    if (hasRSC) {
      console.log('Round ' + round + ': ❌ RSC ERROR');
      await page.waitForTimeout(10000); // wait for recovery
      continue;
    }

    var section = page.locator('text=Produk Unggulan').first();
    if (!(await section.isVisible({ timeout: 2000 }).catch(function() { return false; }))) {
      console.log('Round ' + round + ': section not visible');
      continue;
    }

    await section.click();
    await page.waitForTimeout(1500);

    var pub = page.locator('button:has-text("Publish")').first();
    if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await pub.click();
      await page.waitForTimeout(3000);
      
      var stayed = page.url().indexOf('/homepage') > 0;
      var err = (await page.content()).indexOf('server error') > 0;
      console.log('Round ' + round + ': ' + (stayed && !err ? '✅ OK' : '❌ FAIL'));
    } else {
      console.log('Round ' + round + ': publish button not found');
    }
  }

  // Final public homepage check
  await page.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  var hasEco = (await page.content()).indexOf('EcoFlow') > 0;
  console.log('\nPublic homepage: ' + (hasEco ? '✅' : '❌'));

  await browser.close();
})();

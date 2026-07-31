const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  // Capture ALL form submissions to homepage endpoint
  var captureDone = false;
  p.on('request', function(r) {
    if (r.url().includes('homepage') && r.method() === 'POST' && !captureDone) {
      captureDone = true;
      var body = r.postData();
      // Extract the settings field from form data
      var match = body.match(/settings=([^&]+)/);
      if (match) {
        var decoded = decodeURIComponent(match[1]);
        var parsed = JSON.parse(decoded);
        console.log('SAVE PAYLOAD — heroProductId:', JSON.stringify(parsed.heroProductId));
      }
    }
  });

  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(6000);

  // Click Hero
  var heroRow = p.locator('[class*="cursor-pointer"]').first();
  await heroRow.click();
  await p.waitForTimeout(2000);
  console.log('1. Hero opened');

  // Select product
  var picker = p.locator('input[placeholder="Pilih produk unggulan..."]');
  if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await picker.click();
    await picker.fill('delta');
    await p.waitForTimeout(2500);
    var c = await p.evaluate(function() { return document.querySelectorAll('.absolute button.w-full').length; });
    if (c > 0) {
      await p.evaluate(function() { document.querySelectorAll('.absolute button.w-full')[0].click(); });
      await p.waitForTimeout(1500);
      
      // Publish
      var pub = p.locator('button:has-text("Publish")').first();
      if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
        await pub.click();
        await p.waitForTimeout(5000);
      }
    }
  }

  if (!captureDone) console.log('No POST captured');
  await b.close();
})();

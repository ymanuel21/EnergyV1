const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(6000);

  // Click Produk Unggulan → Publish
  await p.locator('text=Produk Unggulan').first().click();
  await p.waitForTimeout(2000);

  var pub = p.locator('button:has-text("Publish")').first();
  if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await pub.click();
    console.log('1. Clicked Publish');
    
    // Wait and check for success
    for (var i = 0; i < 8; i++) {
      await p.waitForTimeout(1000);
      var savedEl = await p.locator('.text-green-600').count().catch(function() { return 0; });
      if (savedEl > 0) console.log('2. [' + i + 's] ✓ Published indicator visible');
      if (!p.url().includes('/homepage')) { console.log('2. [' + i + 's] Navigated away!'); break; }
    }
  }

  // Refresh
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(6000);

  var t = await p.evaluate(function() { return document.body.innerText; });
  var draftCount = (t.match(/Draft/g) || []).length;
  var pubCount = (t.match(/Published/g) || []).length;
  console.log('3. After refresh: Draft=' + draftCount + ' Published=' + pubCount);

  // Check for Produk Unggulan section specifically
  var lines = t.split('\n');
  for (var j = 0; j < lines.length; j++) {
    if (lines[j].indexOf('Produk Unggulan') >= 0) {
      console.log('4. Line ' + j + ': ' + lines[j]);
      console.log('   Next line: ' + (lines[j+1] || '') + ' ' + (lines[j+2] || ''));
      break;
    }
  }

  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(6000);

  // Find Hero section — it's the first section with Published status and "🏠 Tenaga surya" text
  // Click the section row that has "Tenaga surya" as paragraph text inside a clickable div
  var heroRow = p.locator('p:text("Tenaga surya")').first();
  if (await heroRow.isVisible({ timeout: 3000 }).catch(function() { return false; })) {
    // Click the parent clickable element
    var parent = heroRow.locator('..');
    var clickable = parent.locator('..');
    await clickable.click();
    await p.waitForTimeout(2000);
    console.log('1. Hero section opened');
  }

  // Find Hero Product picker
  var allInputs = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('input[placeholder]')).map(function(i) { return i.placeholder; });
  });
  console.log('2. Inputs:', JSON.stringify(allInputs));

  var picker = p.locator('input[placeholder="Pilih produk unggulan..."]').first();
  var vis = await picker.isVisible({ timeout: 2000 }).catch(function() { return false; });
  console.log('3. Hero picker visible:', vis);

  if (vis) {
    await picker.click();
    await picker.fill('delta');
    await p.waitForTimeout(2500);
    var count = await p.evaluate(function() { return document.querySelectorAll('.absolute button.w-full').length; });
    console.log('4. Dropdown:', count);
    
    if (count > 0) {
      await p.evaluate(function() { document.querySelectorAll('.absolute button.w-full')[0].click(); });
      await p.waitForTimeout(1500);
      
      // Publish
      var pub = p.locator('button:has-text("Publish")').first();
      if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
        await pub.click();
        await p.waitForTimeout(4000);
        console.log('5. Published');
      }
    }
  }

  // Verify public homepage
  await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(5000);
  var heroSrc = await p.evaluate(function() {
    var imgs = document.querySelectorAll('img[alt]');
    return Array.from(imgs).filter(function(i) { return i.width > 200; }).map(function(i) { return i.alt + ':' + i.src.substring(i.src.lastIndexOf('/')+1, 40); }).join(' | ');
  });
  console.log('6. Hero:', heroSrc);

  await b.close();
})();

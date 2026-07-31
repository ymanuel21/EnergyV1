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
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(6000);

  // Click first section (Hero) — use the first clickable row with "Tenaga surya" that's near "Published"
  var rows = await p.evaluate(function() {
    var all = document.querySelectorAll('[class*="cursor-pointer"]');
    return Array.from(all).slice(0, 15).map(function(el, i) {
      return i + ': ' + el.textContent.substring(0, 40);
    });
  });
  console.log('Rows:', JSON.stringify(rows));

  // Click the FIRST section (Hero = Tenaga surya)
  var heroEl = p.locator('[class*="cursor-pointer"]').first();
  await heroEl.click();
  await p.waitForTimeout(2000);

  // Check which section is being edited
  var titleInput = p.locator('input[placeholder="Section Title"]');
  var titleVal = await titleInput.inputValue().catch(function() { return 'not found'; });
  console.log('Editing section title:', titleVal);

  // If this is "Tenaga surya", find the picker
  if (titleVal === 'Tenaga surya') {
    var picker = p.locator('input[placeholder="Pilih produk unggulan..."]');
    if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await picker.click();
      await picker.fill('delta');
      await p.waitForTimeout(2500);
      
      var c = await p.evaluate(function() { return document.querySelectorAll('.absolute button.w-full').length; });
      console.log('Dropdown:', c);
      
      if (c > 0) {
        await p.evaluate(function() { document.querySelectorAll('.absolute button.w-full')[0].click(); });
        await p.waitForTimeout(1500);
        
        var pub = p.locator('button:has-text("Publish")').first();
        if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
          await pub.click();
          await p.waitForTimeout(4000);
          console.log('Published');
        }
      }
    }
  } else {
    console.log('Wrong section opened — title:', titleVal);
  }

  await b.close();
})();

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
  await p.locator('[class*="cursor-pointer"]').nth(3).click();
  await p.waitForTimeout(2000);
  await p.locator('select').first().selectOption('manual');
  await p.waitForTimeout(1500);

  // Dump ALL inputs and textareas
  var all = await p.evaluate(function() {
    return {
      inputs: Array.from(document.querySelectorAll('input')).map(function(i) { return i.placeholder || i.name || i.type; }),
      textareas: Array.from(document.querySelectorAll('textarea')).map(function(t) { return t.placeholder || t.name || t.getAttribute('data-key'); })
    };
  });
  console.log(JSON.stringify(all, null, 1));

  await b.close();
})();

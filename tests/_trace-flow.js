const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(function() {});
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);
  
  // Check DB directly for productIds
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(function() {});
  await p.waitForTimeout(5000);

  // Click Produk Unggulan
  try { await p.locator('text=Produk Unggulan').first().click(); await p.waitForTimeout(2000); } catch(e) {}

  // Get chips
  var chips = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('span.inline-flex.items-center.gap-1\\.5')).map(function(s) { return s.textContent.trim().substring(0,40); });
  });
  console.log('Selected chips:', JSON.stringify(chips));

  // Check public page
  await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(function() {});
  await p.waitForTimeout(5000);

  var allProducts = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('a[href*="/produk/"]')).map(function(a) { return a.getAttribute('href'); }).slice(0, 10);
  });
  console.log('Public product links:', JSON.stringify(allProducts));

  await b.close();
})();

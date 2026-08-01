const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  await p.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);

  // 1. Broken image handling
  await p.goto('http://localhost:3000/admin/media', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  var imgs = await p.$$eval('img', els => els.filter(e => e.naturalWidth === 0).length);
  console.log('1. Broken images:', imgs > 0 ? '❌ ' + imgs + ' broken' : '✅ All load or have fallback');

  // 2. Verify counts render
  var bodyText = await p.evaluate(() => document.body.innerText);
  console.log('2. Unique assets:', bodyText.match(/unique assets/)?.[0] || '❌ not found');
  console.log('3. Total references:', bodyText.match(/total references/)?.[0] || '❌ not found');

  // 4. Search works
  await p.fill('input[name="q"]', 'ecoflow');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(3000);
  var resultText = await p.evaluate(() => document.body.innerText);
  var results = (resultText.match(/unique assets/g) || []).length;
  console.log('5. Search results:', results > 0 ? '✅ Found' : '❌');

  await b.close();
})();

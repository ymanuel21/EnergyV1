const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  async function test(name, setup, expectUrl) {
    // Fresh context for each test to clear sessionStorage
    var ctx = await b.newContext();
    var page = await ctx.newPage();

    // Run setup (navigate to listing, then to detail)
    await setup(page);

    // Click back button
    var btn = page.locator('text=← Kembali');
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      var final = page.url();
      var pass = final.includes(expectUrl);
      console.log(name + ':', pass ? '✅' : '❌', '→', final.substring(22, 60));
    } else {
      console.log(name + ': ❌ (no button)');
    }
    await ctx.close();
  }

  // 1. Home → Project → Back → Home
  await test('Home→Project→Back', async (page) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  }, 'localhost:3000/');

  // 2. Project Listing → Project → Back → Listing
  await test('Listing→Project→Back', async (page) => {
    await page.goto('http://localhost:3000/proyek', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // wait for TrackPage
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  }, '/proyek');

  // 3. Products → Project → Back → Products
  await test('Products→Project→Back', async (page) => {
    await page.goto('http://localhost:3000/produk', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  }, '/produk');

  // 4. Direct URL (no prior page) → fallback to /proyek
  await test('Direct→Fallback', async (page) => {
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  }, '/proyek');

  await b.close();
  console.log('\nDone');
})();

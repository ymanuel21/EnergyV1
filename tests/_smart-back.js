const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  async function test(name, flow) {
    try { await flow(p); console.log(name, '✅'); }
    catch (e) { console.log(name, '❌', e.message.substring(0, 60)); }
  }

  // 1. Homepage → Detail → Back
  await test('Home→Detail→Back', async (page) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('button[aria-label="Kembali ke halaman sebelumnya"]').click();
    await page.waitForTimeout(1500);
    var ok = page.url().includes('localhost:3000/') && !page.url().includes('/proyek/');
    if (!ok) throw new Error('Expected homepage, got ' + page.url());
  });

  // 2. Project List → Detail → Back
  await test('List→Detail→Back', async (page) => {
    await page.goto('http://localhost:3000/proyek', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('button[aria-label="Kembali ke halaman sebelumnya"]').click();
    await page.waitForTimeout(1500);
    var ok = page.url().includes('/proyek') && !page.url().includes('/proyek/');
    if (!ok) throw new Error('Expected /proyek, got ' + page.url());
  });

  // 3. Direct URL → Back (no history) → fallback
  await test('Direct→Fallback', async (page) => {
    await page.goto('http://localhost:3000/proyek/plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.locator('button[aria-label="Kembali ke halaman sebelumnya"]').click();
    await page.waitForTimeout(1500);
    var ok = page.url().includes('/proyek') && !page.url().includes('/proyek/');
    if (!ok) throw new Error('Expected /proyek fallback, got ' + page.url());
  });

  // 4. Products list → Product Detail → Back
  await test('Products→Detail→Back', async (page) => {
    await page.goto('http://localhost:3000/produk', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:3000/produk/ecoflow-160w-lightweight-solar-panel', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    var btn = page.locator('button:has-text("← Kembali")');
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      var ok = page.url().includes('/produk') && !page.url().includes('/produk/');
      if (!ok) throw new Error('Expected /produk, got ' + page.url());
    }
  });

  await b.close();
  console.log('\nDone');
})();

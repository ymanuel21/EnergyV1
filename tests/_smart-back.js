const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  // 1. Product list → detail → back
  await p.goto('http://localhost:3000/produk', { waitUntil: 'networkidle' });
  await p.locator('a[href*="/produk/ecoflow"]').first().click();
  await p.waitForTimeout(2000);
  var hasBack = await p.locator('text=← Kembali').isVisible().catch(() => false);
  console.log('1. Product back button:', hasBack ? '✅' : '❌');

  await p.locator('text=← Kembali').click();
  await p.waitForTimeout(2000);
  var onProducts = p.url().includes('/produk') && !p.url().includes('/produk/');
  console.log('2. Back to products:', onProducts ? '✅' : '❌');

  // 2. Project list → detail → back
  await p.goto('http://localhost:3000/proyek', { waitUntil: 'networkidle' });
  await p.locator('a[href*="/proyek/"]').first().click();
  await p.waitForTimeout(2000);
  var hasProjBack = await p.locator('text=← Kembali').isVisible().catch(() => false);
  console.log('3. Project back button:', hasProjBack ? '✅' : '❌');

  await p.locator('text=← Kembali').click();
  await p.waitForTimeout(2000);
  var onProyek = p.url().includes('/proyek') && !p.url().includes('/proyek/');
  console.log('4. Back to proyek:', onProyek ? '✅' : '❌');

  // 3. Direct URL (no history) → uses fallback
  await p.goto('http://localhost:3000/produk/ecoflow-160w-lightweight-solar-panel', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  var label = await p.locator('text=← Kembali').innerText().catch(() => '');
  console.log('5. Direct URL label:', label.includes('Produk') ? '✅' : '❌ (' + label + ')');

  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  // 1. Toggle compare on product
  await p.goto('http://localhost:3000/produk/ecoflow-160w-lightweight-solar-panel', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.locator('text=Bandingkan').click();
  await p.waitForTimeout(1000);

  var stored = await p.evaluate(() => localStorage.getItem('energyv1-compare'));
  var items = JSON.parse(stored || '{}').items || [];
  console.log('Stored IDs:', items);

  // 2. Get product IDs from API
  var resp = await p.evaluate(async () => {
    var r = await fetch('/api/products');
    return await r.json();
  });
  var allIds = resp.map(pr => pr.id);
  console.log('API sample IDs:', allIds.slice(0, 3), '... total:', allIds.length);

  // 3. Match
  var found = resp.filter(pr => items.includes(pr.id));
  console.log('Matching products:', found.length);

  // 4. What is product.id on the detail page?
  await p.goto('http://localhost:3000/produk/ecoflow-160w-lightweight-solar-panel', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  var productId = await p.evaluate(() => window.__NEXT_DATA__?.props?.pageProps);
  console.log('Page props product id:', productId);

  // 5. Check directly from HTML
  var ogId = await p.evaluate(() => {
    var btn = document.querySelector('[data-testid="compare-toggle"]');
    return btn ? 'found' : 'not found';
  });
  console.log('Compare toggle in DOM:', ogId);

  await b.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  const picker = page.locator('input[placeholder="Cari produk..."]').first();
  await picker.click();
  await picker.fill('eco');
  await page.waitForTimeout(2000);

  // Trace all ancestor links of the dropdown button
  const ancestors = await page.evaluate(() => {
    const btn = document.querySelector('.absolute button.w-full');
    if (!btn) return 'no button';
    const chain = [];
    let el = btn;
    for (let i = 0; i < 15; i++) {
      if (!el) break;
      chain.push({
        tag: el.tagName,
        id: el.id || undefined,
        href: el.tagName === 'A' ? el.getAttribute('href') : undefined,
        onClick: el.onclick ? 'has onclick' : undefined,
        role: el.getAttribute('role') || undefined,
      });
      el = el.parentElement;
    }
    return chain;
  });
  console.log('ANCESTORS:', JSON.stringify(ancestors, null, 1));

  await browser.close();
})();

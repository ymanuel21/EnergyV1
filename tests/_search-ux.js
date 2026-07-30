const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(5000);

  const s = p.locator('#header-search');
  const vis = await s.isVisible().catch(() => false);
  console.log('Search visible:', vis);
  if (!vis) { await b.close(); return; }

  await s.focus();
  await s.fill('eco');
  await p.waitForTimeout(3000);

  const btns = p.locator('.absolute button');
  const c = await btns.count().catch(() => 0);
  console.log('Buttons found:', c);

  if (c > 0) {
    const texts = [];
    for (let i = 0; i < Math.min(c, 3); i++) texts.push(await btns.nth(i).textContent());
    console.log('Items:', JSON.stringify(texts));

    await btns.first().click();
    await p.waitForTimeout(3000);
    console.log('Navigated to:', p.url().substring(0, 60));
  }

  await b.close();
})();

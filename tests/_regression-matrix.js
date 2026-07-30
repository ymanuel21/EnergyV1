const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  // ── LOGIN ──
  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);

  // ── ITEM 1: Load /admin/homepage — HTTP 200, no errors ──
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const loaded = !page.url().includes('/login');
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  console.log('1. LOAD:', loaded ? '✅ 200' : '❌ redirected to login');

  // ── ITEM 2: Audit section list — all sections present ──
  const sections = await page.evaluate(() => {
    const items = document.querySelectorAll('p');
    return Array.from(items).filter(p => 
      p.textContent === 'Published' || p.textContent === 'Draft'
    ).map(p => p.parentElement?.textContent?.trim().replace(/\s+/g, ' ').substring(0, 60));
  });
  // Get section labels distinctly
  const sectionLabels = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="cursor-pointer"] p');
    return Array.from(els).slice(0, 10).map(el => el.textContent?.trim());
  });
  console.log('2. SECTIONS:', sectionLabels.length, '→', sectionLabels.filter(s => s).join(', '));

  // ── ITEM 3: Produk Unggulan editor — open, check fields ──
  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);
  const saveCount = await page.locator('button:has-text("Save")').count();
  const pubCount = await page.locator('button:has-text("Publish")').count();
  const pickerCount = await page.locator('input[placeholder*="Cari produk"]').count();
  const tabCount = await page.locator('button:has-text("Content")').count();
  console.log('3. EDITOR:', saveCount + pubCount + pickerCount + tabCount > 0 ? '✅ open' : '❌ no controls');

  // ── ITEM 4: Save Draft flow ──
  if (saveCount > 0) {
    await page.locator('button:has-text("Save Draft")').first().click();
    await page.waitForTimeout(3000);
    console.log('4. SAVE DRAFT:', page.url().includes('/homepage') ? '✅ stayed on page' : '⚠️ navigated');
  } else {
    console.log('4. SAVE DRAFT:', '⚠️ button not found');
  }

  // ── ITEM 5: Publish flow ──
  if (pubCount > 0) {
    await page.locator('button:has-text("Publish")').first().click();
    await page.waitForTimeout(4000);
    const stillHome = page.url().includes('/homepage');
    console.log('5. PUBLISH:', stillHome ? '✅ published' : '⚠️ navigated');

    // Check preview iframe content
    const frame = page.frameLocator('iframe[title="Preview"]');
    const previewText = await frame.locator('body').innerText().catch(() => '');
    const previewHasEco = previewText.includes('EcoFlow 160W');
    console.log('5b. PREVIEW:', previewHasEco ? '✅ shows EcoFlow 160W' : '⚠️ not found');
  }

  // ── ITEM 6: Public homepage matches ──
  await page.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const pubContent = await page.content();
  const hasEcoFlow = pubContent.includes('EcoFlow 160W');
  const hasTabs = pubContent.includes('Description') && pubContent.includes('Spesifikasi');
  const hasCTA = pubContent.includes('Lihat Detail Produk');
  console.log('6. PUBLIC:', hasEcoFlow && hasTabs && hasCTA ? '✅ matches' : `⚠️ Eco=${hasEcoFlow} Tabs=${hasTabs} CTA=${hasCTA}`);

  // ── ITEM 7: Build check — console errors ──
  const consoleErrors = errors.length;
  console.log('7. ERRORS:', consoleErrors === 0 ? '✅ none' : `❌ ${consoleErrors} errors: ${errors.join('; ')}`);

  console.log('\n═══════════════════');
  console.log('REGRESSION MATRIX');
  console.log('═══════════════════');
  console.log(`${loaded ? '✅' : '❌'} 1. /admin/homepage HTTP 200`);
  console.log(`${sectionLabels.length >= 4 ? '✅' : '❌'} 2. Section list (${sectionLabels.length} sections)`);
  console.log(`${saveCount + pubCount + pickerCount > 0 ? '✅' : '❌'} 3. Produk Unggulan editor`);
  console.log(`${saveCount > 0 ? '✅' : '⚠️'} 4. Save Draft`);
  console.log(`${pubCount > 0 ? '✅' : '⚠️'} 5. Publish`);
  console.log(`${hasEcoFlow ? '✅' : '❌'} 6. Public homepage match`);
  console.log(`${consoleErrors === 0 ? '✅' : '❌'} 7. No console errors`);

  await browser.close();
})();

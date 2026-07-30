// Standalone E2E: verify ProductPicker autocomplete
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Login
  await page.goto('https://energyv1.vercel.app/admin/login');
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  console.log('1. LOGIN:', page.url().includes('/admin') ? 'OK' : 'FAILED');

  // 2. Go to homepage builder
  await page.goto('https://energyv1.vercel.app/admin/homepage');
  await page.waitForTimeout(3000);
  console.log('2. HOMEPAGE:', page.url().includes('/homepage') ? 'OK' : 'FAILED');

  // 3. Click Produk Unggulan section
  const section = page.locator('text=Produk Unggulan').first();
  const secVisible = await section.isVisible().catch(() => false);
  console.log('3. SECTION visible:', secVisible);
  if (secVisible) await section.click();

  // 4. Look for ⧉ expand button
  const pageContent = await page.content();
  const hasExpandBtn = pageContent.includes('⧉');
  console.log('4. HAS ⧉ button:', hasExpandBtn);
  
  // Click it if found
  if (hasExpandBtn) {
    const btn = page.locator('button').filter({ hasText: '⧉' }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 5. Find Cari produk input
  await page.waitForTimeout(1000);
  const allInputs = await page.evaluate(() => 
    Array.from(document.querySelectorAll('input[placeholder]')).map(i => ({
      placeholder: i.placeholder,
      type: i.type,
      visible: i.offsetParent !== null
    }))
  );
  console.log('5. INPUTS with placeholder:', JSON.stringify(allInputs, null, 2));

  // 6. Find the ProductPicker input and type
  const picker = page.locator('input[placeholder*="Cari produk"]').first();
  const pickerVisible = await picker.isVisible().catch(() => false);
  console.log('6. PICKER visible:', pickerVisible);
  
  if (pickerVisible) {
    await picker.click();
    await picker.fill('eco');
    await page.waitForTimeout(2000);
    console.log('7. Typed "eco"');

    // Check dropdown
    const dropdownItems = await page.evaluate(() => {
      const btns = document.querySelectorAll('.absolute button, [role="listbox"] button, [role="option"]');
      return Array.from(btns).slice(0, 5).map(b => b.textContent?.trim());
    });
    console.log('8. DROPDOWN items:', JSON.stringify(dropdownItems));

    // Check if API was called
    const requests = [];
    page.on('response', r => {
      if (r.url().includes('search-products')) {
        r.text().then(t => requests.push({ status: r.status(), url: r.url(), body: t }));
      }
    });
    await page.waitForTimeout(1000);
    console.log('9. API calls:', JSON.stringify(requests));
  }

  // 7. Take screenshot regardless
  await page.screenshot({ path: '/tmp/admin-picker-test.png', fullPage: true });
  console.log('10. Screenshot saved to /tmp/admin-picker-test.png');

  await browser.close();
  console.log('DONE');
})();

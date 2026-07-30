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
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  await page.locator('text=Produk Unggulan').first().click();
  await page.waitForTimeout(2000);

  var picker = page.locator('input[placeholder="Cari produk..."]').first();
  if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await picker.click();
    await picker.fill('delta');
    await page.waitForTimeout(2500);

    // Inspect the actual dropdown button HTML
    var btnHTML = await page.evaluate(function() {
      var btns = document.querySelectorAll('.absolute button.w-full');
      if (btns.length === 0) return 'NO BUTTONS';
      var b = btns[0];
      return {
        tag: b.tagName,
        type: b.getAttribute('type'),
        onclick: b.onclick ? 'HAS onclick' : 'NO onclick',
        parentTag: b.parentElement.tagName,
        parentOnClick: b.parentElement.onclick ? 'HAS' : 'NO',
        outerHTML: b.outerHTML.substring(0, 300)
      };
    });
    console.log('BUTTON:', JSON.stringify(btnHTML, null, 1));

    // Try intercepting ALL navigation
    await page.route('**', function(route) {
      var url = route.request().url();
      if (url.indexOf('/produk/') >= 0 && route.request().isNavigationRequest()) {
        console.log('BLOCKED nav to:', url.substring(30, 70));
        route.abort();
      } else {
        route.continue();
      }
    });

    // Click and see what happens
    var preUrl = page.url();
    await page.evaluate(function() {
      var btns = document.querySelectorAll('.absolute button.w-full');
      if (btns.length > 0) {
        console.log('Native click on:', btns[0].textContent.trim().substring(0, 40));
        btns[0].click();
      }
    });
    
    // Wait and check
    await page.waitForTimeout(2000);
    var navigated = page.url() !== preUrl;
    console.log('Navigated:', navigated, navigated ? page.url().substring(0, 60) : 'STAYED');
  }

  await browser.close();
})();

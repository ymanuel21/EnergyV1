const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('══════════════════════════════');
  console.log('  BUG 1 — Publish error handling');
  console.log('══════════════════════════════');

  // Login
  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);

  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Check if page loaded or RSC error
  var hasError = await page.locator('text=server error,text=This page couldn').count().catch(function() { return 0; });
  console.log('1. Page state:', hasError > 0 ? 'RSC ERROR' : 'LOADED');

  if (hasError === 0) {
    // Click Produk Unggulan
    var section = page.locator('text=Produk Unggulan').first();
    if (await section.isVisible({ timeout: 3000 }).catch(function() { return false; })) {
      await section.click();
      await page.waitForTimeout(2000);
      console.log('2. Section opened');

      // Find Publish button
      var pubBtn = page.locator('button:has-text("Publish")').first();
      if (await pubBtn.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
        console.log('3. Publish button: VISIBLE');

        // Test: Click Publish and check for loading cleanup
        await pubBtn.click();
        console.log('4. Clicked Publish');
        
        // Monitor state for 8 seconds
        var loadingSeen = false;
        var cleanedUp = false;
        var published = false;
        
        for (var i = 0; i < 8; i++) {
          await page.waitForTimeout(1000);
          
          // Check if still on homepage
          if (!page.url().includes('/homepage')) {
            console.log('5. [' + i + 's] NAVIGATED AWAY');
            break;
          }
          
          // Check loading indicators
          var savingBtns = await page.locator('button:has-text("Saving"),text=saving,text=Loading,text=loading').count().catch(function() { return 0; });
          var pubBtns = await page.locator('button:has-text("Publish")').count().catch(function() { return 0; });
          var saveBtns = await page.locator('button:has-text("Save")').count().catch(function() { return 0; });
          
          if (savingBtns > 0 && !loadingSeen) {
            loadingSeen = true;
            console.log('5. [' + i + 's] Loading state active');
          }
          if (savingBtns === 0 && pubBtns > 0 && loadingSeen && !cleanedUp) {
            cleanedUp = true;
            published = true;
            console.log('5. [' + i + 's] Loading CLEARED — publish complete');
          }
        }
        
        if (!loadingSeen) console.log('6. No loading state detected (may already be published)');
        if (cleanedUp) console.log('7. ✅ Loading state properly cleaned up');
        if (!cleanedUp && loadingSeen) console.log('7. ❌ Loading state NOT cleaned up');
        
        // Verify preview iframe content
        var frame = page.frameLocator('iframe[title="Preview"]');
        var previewText = await frame.locator('body').innerText().catch(function() { return ''; });
        var hasEcoFlow = previewText.indexOf('EcoFlow 160W') >= 0;
        console.log('8. Preview has EcoFlow 160W:', hasEcoFlow);
        
        // Check public homepage
        var page2 = await ctx.newPage();
        await page2.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
        await page2.waitForTimeout(4000);
        var pubContent = await page2.content();
        var pubHasEco = pubContent.indexOf('EcoFlow 160W') >= 0;
        console.log('9. Public has EcoFlow 160W:', pubHasEco);
        await page2.close();
      } else {
        console.log('3. Publish button: NOT FOUND');
      }
    }
  }

  console.log('');
  console.log('══════════════════════════════');
  console.log('  BUG 2 — ProductPicker events');
  console.log('══════════════════════════════');

  // Navigate back to login and retest ProductPicker
  // (reuse existing session)
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  var section2 = page.locator('text=Produk Unggulan').first();
  if (await section2.isVisible({ timeout: 3000 }).catch(function() { return false; })) {
    await section2.click();
    await page.waitForTimeout(2000);

    // Find × button to clear current selection
    var closeBtn = page.locator('button:has-text("×")').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await closeBtn.click();
      await page.waitForTimeout(1500);
      console.log('10. Cleared current selection');
    }

    // Check picker visible
    var picker = page.locator('input[placeholder="Cari produk..."]').first();
    if (await picker.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await picker.click();
      await picker.fill('eco');
      await page.waitForTimeout(2000);
      
      var dropItems = await page.evaluate(function() {
        var btns = document.querySelectorAll('.absolute button.w-full');
        return btns.length;
      });
      console.log('11. Dropdown items:', dropItems);

      if (dropItems > 0) {
        var preUrl = page.url();
        await page.evaluate(function() {
          var btns = document.querySelectorAll('.absolute button.w-full');
          if (btns.length > 0) btns[0].click();
        });
        await page.waitForTimeout(2000);
        
        var navigated = page.url() !== preUrl;
        console.log('12. After select — navigated:', navigated, navigated ? '❌' : '✅ STAYED');

        // Check chip visible
        var chips = await page.evaluate(function() {
          var spans = document.querySelectorAll('span.text-primary');
          return Array.from(spans).map(function(s) { return s.textContent.substring(0, 30); });
        });
        console.log('13. Selected chips:', chips.filter(function(c) { return c && c !== '×'; }).join(', ') || 'none');
      }
    }
  }

  console.log('');
  console.log('══════════════════════════════');
  console.log('  REGRESSION CHECK');
  console.log('══════════════════════════════');

  // Check public homepage one more time
  var page3 = await ctx.newPage();
  await page3.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await page3.waitForTimeout(4000);
  var finalContent = await page3.content();
  var finalHasEco = finalContent.indexOf('EcoFlow 160W') >= 0;
  var finalHasDesc = finalContent.indexOf('Description') >= 0;
  var finalHasSpec = finalContent.indexOf('Spesifikasi') >= 0;
  console.log('Homepage:', finalHasEco ? 'EcoFlow' : 'MISSING', finalHasDesc ? 'Desc' : 'NO-DESC', finalHasSpec ? 'Specs' : 'NO-SPECS');
  await page3.close();

  await browser.close();
  console.log('\nDONE');
})();

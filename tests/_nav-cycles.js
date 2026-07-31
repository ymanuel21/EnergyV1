const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(function() {});
  await p.waitForTimeout(5000);

  var errors = [];
  p.on('console', function(m) { if (m.type() === 'error') errors.push(m.text().substring(0,100)); });

  var nextBtn = p.locator('button').filter({ hasText: '' }).nth(0);
  var prevBtn = p.locator('button').filter({ hasText: '' }).nth(1);
  
  // Find navigation arrows — they're SVG buttons in the showcase
  var allBtns = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('button')).map(function(b) {
      return b.outerHTML.substring(0,100) + ' | text:' + (b.textContent || '').substring(0,20);
    });
  });
  // Find the next/prev buttons by looking for SVG arrow buttons
  nextBtn = p.locator('button').filter({ has: p.locator('svg') }).first();
  prevBtn = p.locator('button').filter({ has: p.locator('svg') }).nth(1);

  for (var cycle = 1; cycle <= 20; cycle++) {
    // Navigate to Product 2
    var beforeSrc = await p.evaluate(function() {
      var imgs = document.querySelectorAll('img[alt*="160W"]');
      return imgs.length > 0 ? imgs[0].src.substring(0,60) : 'none';
    });
    
    await nextBtn.click().catch(function() {});
    await p.waitForTimeout(500);
    
    // Check Product 2 image (should be placeholder)
    var p2Src = await p.evaluate(function() {
      var imgs = document.querySelectorAll('img');
      return Array.from(imgs).filter(function(i) { return i.alt.indexOf('EcoFlow') >= 0; }).map(function(i) { return i.src.indexOf('placeholder') >= 0 ? 'PLACEHOLDER' : 'OK'; }).join(',');
    });

    // Navigate back to Product 1
    await prevBtn.click().catch(function() {});
    await p.waitForTimeout(500);
    
    // Check Product 1 image (should be valid, not placeholder)
    var p1Src = await p.evaluate(function() {
      var imgs = document.querySelectorAll('img');
      return Array.from(imgs).filter(function(i) { return i.alt.indexOf('160W') >= 0; }).map(function(i) { return i.src.indexOf('placeholder') >= 0 ? 'PLACEHOLDER' : 'OK'; }).join(',');
    });

    if (cycle === 1 || cycle % 5 === 0) {
      console.log('Cycle ' + cycle + ': P1=' + p1Src + ' P2=' + p2Src + ' errors=' + errors.length);
    }
    errors = [];
    
    if (p1Src === 'PLACEHOLDER') {
      console.log('❌ Cycle ' + cycle + ': Product 1 shows PLACEHOLDER!');
      break;
    }
  }

  console.log('\nFinal errors:', errors.length);
  await b.close();
})();

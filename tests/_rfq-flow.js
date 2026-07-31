const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto('http://localhost:3000/permintaan-penawaran?project=plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  
  var t1 = await p.evaluate(function() { return document.body.innerText; });
  console.log('Initial items:', t1.indexOf('Dari proyek referensi') >= 0 ? '✅' : '❌');
  
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  
  var t2 = await p.evaluate(function() { return document.body.innerText; });
  console.log('After refresh:', t2.indexOf('Dari proyek referensi') >= 0 ? '✅' : '❌');
  
  // Verify editing works — remove first item
  var removeBtn = p.locator('button:has-text("✕")').first();
  if (await removeBtn.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await removeBtn.click();
    await p.waitForTimeout(500);
    var t3 = await p.evaluate(function() { return document.body.innerText; });
    var itemsCount = (t3.match(/✕/g) || []).length;
    console.log('After remove (✕ count):', itemsCount === 1 ? '✅ 1 remaining' : '❌ ' + itemsCount);
  }
  
  await b.close();
})();

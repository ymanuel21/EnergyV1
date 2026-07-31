const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  // 1. Navigate to RFQ with project param
  await p.goto('http://localhost:3000/permintaan-penawaran?project=plts-atap-rumah-bandung-54-kwp', { waitUntil: 'networkidle' });
  await p.waitForTimeout(5000);

  // 2. Get the rendered DOM — look specifically at Daftar Kebutuhan section
  var dom = await p.evaluate(() => {
    // Find all elements containing item info
    var items = document.querySelectorAll('.rounded-lg.bg-gray-50');
    var results = [];
    items.forEach(function(el) { results.push(el.innerText); });
    return {
      itemCount: items.length,
      items: results,
      fullPage: document.body.innerText.substring(0, 500)
    };
  });
  
  console.log('Rendered items:', dom.itemCount);
  dom.items.forEach(function(item, i) { console.log(`  ${i+1}.`, item); });

  // 3. Check if there's a merge dialog
  var merge = await p.locator('[role="dialog"]').count();
  console.log('Merge dialog elements:', merge);

  // 4. Check specific RFQ section text
  var rfqIdx = dom.fullPage.indexOf('Daftar Kebutuhan');
  if (rfqIdx >= 0) {
    console.log('\nDaftar Kebutuhan section:');
    console.log(dom.fullPage.substring(rfqIdx, rfqIdx + 300));
  }

  // 5. Verify items are rendered as DOM nodes (not just state)
  var itemBtns = await p.locator('button:has-text("✕")').count();
  console.log('\n✕ remove buttons:', itemBtns);

  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);

  async function cycle(label) {
    await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
    await p.waitForTimeout(8000);

    // Check pre-publish state
    var t = await p.evaluate(function() { return document.body.innerText; });
    var draftCount = (t.match(/Draft/g) || []).length;
    
    await p.locator('text=Produk Unggulan').first().click();
    await p.waitForTimeout(2000);

    var pub = p.locator('button:has-text("Publish")').first();
    if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await pub.click();
      // Wait for success
      await p.waitForTimeout(5000);
    }

    // Refresh and verify
    await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
    await p.waitForTimeout(8000);
    
    var t2 = await p.evaluate(function() { return document.body.innerText; });
    var lines = t2.split('\n');
    var status = '?';
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('Produk Unggulan') >= 0) {
        status = (lines[i+1] || '') + ' ' + (lines[i+2] || '');
        break;
      }
    }
    var afterDrafts = (t2.match(/Draft/g) || []).length;
    var afterPubs = (t2.match(/Published/g) || []).length;
    console.log(label + ' Drafts: ' + draftCount + '→' + afterDrafts + ' Pubs: ' + afterPubs + ' | ' + status.trim());
  }

  console.log('=== 3 PUBLISH CYCLES ===');
  await cycle('C1');
  await cycle('C2');
  await cycle('C3');

  // Check DB
  await b.close();
})();

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();

  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);

  async function refresh() {
    await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
    await p.waitForTimeout(6000);
  }
  async function getStatus(sectionName) {
    var t = await p.evaluate(function() { return document.body.innerText; });
    var lines = t.split('\n');
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(sectionName) >= 0) return (lines[i+1] || '') + ' ' + (lines[i+2] || '');
    }
    return '?';
  }

  await refresh();

  // ── HERO ──
  console.log('=== HERO ===');
  var rows = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('[class*="cursor-pointer"]')).slice(0,2).map(function(el) { return el.textContent.substring(0,40); });
  });
  console.log('Sections:', JSON.stringify(rows));
  
  // Click Hero (first row)
  await p.locator('[class*="cursor-pointer"]').first().click();
  await p.waitForTimeout(2000);

  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
  await p.waitForTimeout(6000);

  // Click Hero (first row)
  await p.locator('[class*="cursor-pointer"]').first().click();
  await p.waitForTimeout(2000);

  var pubBtn = p.locator('button:has-text("Publish")').first();
  if (await pubBtn.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await pubBtn.click();
    await p.waitForTimeout(4000);
    console.log('Hero: Published');
  } else {
    console.log('Hero: No publish button');
  }
  await refresh();
  console.log('Hero status:', await getStatus('Tenaga surya'));

  // ── PRODUK UNGGULAN ──
  console.log('\n=== PRODUK UNGGULAN ===');
  await p.locator('[class*="cursor-pointer"]').nth(1).click();
  await p.waitForTimeout(2000);
  
  pubBtn = p.locator('button:has-text("Publish")').first();
  if (await pubBtn.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
    await pubBtn.click();
    await p.waitForTimeout(4000);
    console.log('Produk Unggulan: Published');
  }
  await refresh();
  console.log('Produk Unggulan status:', await getStatus('Produk Unggulan'));

  // ── DB check ──
  await b.close();
})();

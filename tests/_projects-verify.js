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

  async function openSetPublish(titleVal, descVal) {
    await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' }).catch(function() {});
    await p.waitForTimeout(6000);
    await p.locator('[class*="cursor-pointer"]').nth(3).click();
    await p.waitForTimeout(2000);
    await p.locator('select').first().selectOption('manual');
    await p.waitForTimeout(1000);

    var ti = p.locator('input[placeholder*="Override title"]');
    var td = p.locator('textarea[placeholder*="Override description"]');
    if (await ti.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await ti.fill(titleVal);
    }
    if (await td.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await td.fill(descVal);
    }
    var pub = p.locator('button:has-text("Publish")').first();
    if (await pub.isVisible({ timeout: 2000 }).catch(function() { return false; })) {
      await pub.click();
      await p.waitForTimeout(4000);
    }
    await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' }).catch(function() {});
    await p.waitForTimeout(5000);
    var html = await p.content();
    return html;
  }

  // Scenario 1: Both overrides filled
  var h1 = await openSetPublish('Project A Custom', 'Description A override');
  console.log('1. Both: title=' + (h1.indexOf('Project A Custom') >= 0) + ' desc=' + (h1.indexOf('Description A override') >= 0));

  // Scenario 2: Both empty → fallback
  var h2 = await openSetPublish('', '');
  console.log('2. Empty: title orig=' + (h2.indexOf('PLTS Atap Rumah Bandung') >= 0));

  // Scenario 3: Title only
  var h3 = await openSetPublish('Title Only Override', '');
  console.log('3. TitleOnly: override=' + (h3.indexOf('Title Only Override') >= 0) + ' desc orig=' + (h3.indexOf('Instalasi panel surya') >= 0));

  // Scenario 4: Description only
  var h4 = await openSetPublish('', 'Desc Only Override 2024');
  console.log('4. DescOnly: title orig=' + (h4.indexOf('PLTS Atap Rumah Bandung') >= 0) + ' desc override=' + (h4.indexOf('Desc Only Override') >= 0));

  // Scenario 5: Clear both again
  var h5 = await openSetPublish('', '');
  console.log('5. Cleared: title=' + (h5.indexOf('PLTS Atap Rumah Bandung') >= 0));

  await b.close();
})();

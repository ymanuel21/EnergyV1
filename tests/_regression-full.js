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

  // 1. Project list
  await p.goto('https://energyv1.vercel.app/admin/projects', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  var text = await p.evaluate(function() { return document.body.innerText; });
  var listOk = text.indexOf('PLTS') >= 0;
  console.log('1. Project list:', listOk ? '✅' : '❌');

  // 2. Open first project edit
  var links = await p.evaluate(function() {
    return Array.from(document.querySelectorAll('a[href*="/admin/projects/"]')).filter(function(a) { return a.href.indexOf('/admin/projects/') >= 0 && a.href.split('/').length > 5; }).map(function(a) { return a.href; });
  });
  console.log('2. Edit links:', links.length);

  if (links.length > 0) {
    await p.goto(links[0], { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(5000);
    var editText = await p.evaluate(function() { return document.body.innerText; });
    var editOk = editText.indexOf('Edit Project') >= 0 || editText.indexOf('Back') >= 0 || editText.indexOf('Delete') >= 0;
    console.log('3. Edit page:', editOk ? '✅' : '❌ — ' + editText.substring(0,80).replace(/\n/g,' '));
  }

  // 4. Homepage check
  await p.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  var hpText = await p.evaluate(function() { return document.body.innerText; });
  var hpOk = hpText.indexOf('Sections') >= 0;
  console.log('4. Homepage:', hpOk ? '✅' : '❌');

  // 5. Products check
  await p.goto('https://energyv1.vercel.app/admin/products', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  var prodText = await p.evaluate(function() { return document.body.innerText; });
  var prodOk = prodText.indexOf('Products') >= 0 || prodText.indexOf('Produk') >= 0;
  console.log('5. Products:', prodOk ? '✅' : '❌');

  // 6. Public homepage
  await p.goto('https://energyv1.vercel.app', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  var pubText = await p.evaluate(function() { return document.body.innerText; });
  var pubOk = pubText.indexOf('Tenaga surya') >= 0;
  console.log('6. Public homepage:', pubOk ? '✅' : '❌');

  await b.close();
})();

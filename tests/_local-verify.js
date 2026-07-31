const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const BASE = 'http://localhost:3002';

  // Login
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);

  async function check(path, label) {
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(function() { return document.body.innerText.substring(0,150); });
    var ok = text.indexOf('500') < 0 && text.indexOf("couldn't load") < 0 && text.indexOf('error') < 0;
    console.log(label + ': ' + (ok ? '✅' : '❌'));
    if (!ok) console.log('  → ' + text.substring(0,80).replace(/\n/g,' '));
  }

  await check('/admin/projects', 'Projects list');
  await check('/admin/homepage', 'Homepage');
  await check('/admin/products', 'Products');
  await check('/', 'Public homepage');

  // Check project list has + New Project button
  await p.goto(BASE + '/admin/projects', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  var hasCreate = await p.locator('text=+ New Project').isVisible({ timeout: 3000 }).catch(function() { return false; });
  console.log('+ New Project button: ' + (hasCreate ? '✅' : '❌'));

  var hasDelete = await p.locator('text=Delete').isVisible({ timeout: 3000 }).catch(function() { return false; });
  console.log('Delete button: ' + (hasDelete ? '✅' : '❌'));

  var hasEdit = await p.locator('text=Edit').isVisible({ timeout: 3000 }).catch(function() { return false; });
  console.log('Edit link: ' + (hasEdit ? '✅' : '❌'));

  // Test create + delete
  if (hasCreate) {
    await p.locator('button:has-text("+ New Project")').click();
    await p.waitForTimeout(3000);
    var afterCreate = await p.evaluate(function() { return document.body.innerText; });
    console.log('After create: ' + (afterCreate.indexOf('New Project') >= 0 ? '✅' : '❌'));
  }

  await b.close();
})();

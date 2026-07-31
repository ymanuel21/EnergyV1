const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  // Capture console errors
  var errors = [];
  p.on('console', function(msg) {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  p.on('pageerror', function(err) { errors.push(err.message); });

  await p.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);

  await p.goto('http://localhost:3000/admin/projects', { waitUntil: 'load' });
  await p.waitForTimeout(5000);

  var text = await p.evaluate(function() { return document.body.innerText; });
  console.log('1. Error overlay:', text.indexOf('couldn') >= 0 ? '❌' : '✅');
  console.log('2. + New Project:', text.indexOf('+ New Project') >= 0 ? '✅' : '❌');
  console.log('3. Sidebar visible:', text.indexOf('Dashboard') >= 0 ? '✅' : '❌');

  // Check console errors
  var reactErrors = errors.filter(function(e) { return e.indexOf('Event handlers') >= 0 || e.indexOf('Hydration') >= 0 || e.indexOf('cannot be passed') >= 0; });
  console.log('4. React errors:', reactErrors.length, reactErrors);

  // Navigate to public page to check cart hydration
  await p.goto('http://localhost:3000', { waitUntil: 'load' });
  await p.waitForTimeout(3000);
  var pubText = await p.evaluate(function() { return document.body.innerText; });
  console.log('5. Public page:', pubText.indexOf('Tenaga surya') >= 0 ? '✅' : '❌');

  console.log('\nError count:', errors.length);
  await b.close();
})();

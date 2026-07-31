const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  var consoleErrors = [];
  p.on('console', function(msg) { 
    if (msg.type() === 'error' && !msg.text().includes('hmr') && !msg.text().includes('WebSocket'))
      consoleErrors.push(msg.text()); 
  });

  await p.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('form[action="/api/login"] button[type="submit"]').click();
  await p.waitForTimeout(5000);
  await p.goto('http://localhost:3000/admin/projects/cms6tlw3o0009gncbnk89y9ro', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);

  var btns = p.locator('button');
  var count = await btns.count();
  for (var i = 0; i < count; i++) {
    var text = await btns.nth(i).innerText();
    if (text.includes('Publish')) {
      await btns.nth(i).click();
      await p.waitForTimeout(6000);
      break;
    }
  }

  consoleErrors.forEach(function(e) { console.log('ERROR:', e.substring(0, 500)); });
  await b.close();
})();

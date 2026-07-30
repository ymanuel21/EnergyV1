const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);

  // Track EVERYTHING after page load
  var events = [];
  var startTime = Date.now();

  page.on('request', function(r) {
    if (r.url().indexOf('vercel.app') >= 0) {
      events.push({ t: Date.now() - startTime, type: 'REQ', method: r.method(), url: r.url().substring(r.url().indexOf('.app') + 5).substring(0, 80) });
    }
  });
  page.on('response', function(r) {
    if (r.url().indexOf('vercel.app') >= 0 && (r.status() >= 400 || r.url().indexOf('_rsc') >= 0 || r.url().indexOf('/api/') >= 0 || r.url().indexOf('homepage') >= 0)) {
      events.push({ t: Date.now() - startTime, type: 'RESP', status: r.status(), url: r.url().substring(r.url().indexOf('.app') + 5).substring(0, 80) });
    }
  });
  page.on('console', function(msg) {
    if (msg.type() === 'error') {
      events.push({ t: Date.now() - startTime, type: 'CONSOLE_ERR', text: msg.text().substring(0, 150) });
    }
  });
  page.on('pageerror', function(err) {
    events.push({ t: Date.now() - startTime, type: 'PAGE_ERR', text: err.message.substring(0, 200) });
  });

  console.log('=== Loading /admin/homepage ===');
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'domcontentloaded' });
  console.log('Page loaded at t=0s');

  // Monitor for 20 seconds
  for (var i = 1; i <= 20; i++) {
    await page.waitForTimeout(1000);
    var body = await page.evaluate(function() { return document.body.innerText.substring(0, 80); }).catch(function() { return 'ERROR'; });
    var hasCrash = body.indexOf('couldn') > 0 || body.indexOf('server error') > 0 || body.indexOf('This page') < 0;
    if (hasCrash && body !== 'ERROR') {
      console.log('t=' + i + 's CRASH DETECTED:', body.substring(0, 80));
    }
  }

  // Show last 30 events
  console.log('\n=== LAST 30 EVENTS ===');
  events.slice(-30).forEach(function(e) {
    console.log('[' + (e.t / 1000).toFixed(1) + 's] ' + e.type + ' ' + (e.status || '') + ' ' + (e.url || e.text || ''));
  });

  // Check final page state
  var finalBody = await page.evaluate(function() { return document.body.innerText.substring(0, 200); }).catch(function() { return 'BROKEN'; });
  console.log('\nFinal state:', finalBody.substring(0, 120));

  await browser.close();
})();

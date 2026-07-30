const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } });

  // Capture ALL requests
  var allRequests = [];
  page.on('request', function(r) {
    var url = r.url();
    if (url.indexOf('vercel.app') >= 0 && !url.match(/\.(png|jpg|svg|ico|css|woff)/)) {
      allRequests.push({ 
        type: r.resourceType(), 
        method: r.method(), 
        url: url.substring(url.indexOf('.app') + 4).substring(0, 80),
        headers: r.headers()
      });
    }
  });

  page.on('response', function(r) {
    var url = r.url();
    if (url.indexOf('vercel.app') >= 0 && !url.match(/\.(png|jpg|svg|ico|css|woff)/)) {
      allRequests.push({
        type: 'RESP',
        status: r.status(),
        url: url.substring(url.indexOf('.app') + 4).substring(0, 80),
        headers: r.headers()
      });
    }
  });

  page.on('console', function(msg) { 
    if (msg.type() === 'error') console.log('CONSOLE:', msg.text().substring(0, 150));
  });
  page.on('pageerror', function(err) { console.log('PAGE_ERR:', err.message.substring(0, 200)); });

  // Login
  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');
  await page.locator('form[action="/api/login"] button[type="submit"]').click();
  await page.waitForTimeout(5000);

  // Clear log and navigate
  allRequests = [];
  console.log('=== NAVIGATING TO /admin/homepage ===');

  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('\n=== REQUEST LOG ===');
  allRequests.forEach(function(r) {
    if (r.type === 'RESP' && (r.status >= 400 || r.url.indexOf('_rsc') >= 0 || r.url.indexOf('/api/') >= 0 || r.url.indexOf('homepage') >= 0)) {
      console.log(r.type, r.status, r.url);
    }
    if (r.type === 'xhr' || r.type === 'fetch') {
      console.log(r.type, r.method, r.url);
    }
  });

  // Check body content
  var body = await page.evaluate(function() { return document.body.innerText.substring(0, 400); });
  console.log('\n=== BODY ===');
  console.log(body);

  // Get all RSC payloads
  await browser.close();
})();

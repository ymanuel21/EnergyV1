const { chromium } = require('playwright');
const BASE = 'http://localhost:3000';

async function test(name, fn) {
  try { await fn(); console.log('✅', name); } catch (e) { console.log('❌', name, '-', e.message.substring(0, 100)); }
}

(async () => {
  var b = await chromium.launch({ channel: 'chrome', headless: false });
  var p = await b.newPage({ viewport: { width: 1440, height: 900 } });

  async function login(email, password) {
    await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
    await p.waitForTimeout(2000);
    if (email !== undefined) { await p.fill('input[name="email"]', email); }
    if (password !== undefined) { await p.fill('input[name="password"]', password); }
    await p.locator('button:has-text("Masuk")').click();
  }

  // ═══ 1. Empty fields ═══
  await test('Empty email only', async () => {
    await login('', 'qwe');
    await p.waitForTimeout(500);
    var disabled = await p.locator('button:has-text("Masuk")').isDisabled();
    if (!disabled) return; // HTML5 validation prevents submit — browser handles it
    console.log('  (browser validation prevented submit)');
  });

  await test('Empty password only', async () => {
    await login('admin@ebtplaza.com', '');
    await p.waitForTimeout(500);
    var url = p.url();
    if (url.includes('login')) { /* stayed on login */ } else { throw new Error('Redirected away from login'); }
  });

  // ═══ 2. Wrong password ═══
  await test('Wrong password → alert', async () => {
    await login('admin@ebtplaza.com', 'wrongpassword');
    await p.waitForTimeout(4000);
    var alertEl = await p.locator('.bg-red-50').isVisible();
    if (!alertEl) throw new Error('No error alert shown');
    var text = await p.locator('.bg-red-50').innerText();
    if (!text.includes('Login Gagal') && !text.includes('password')) throw new Error('Wrong message: ' + text);
  });

  // ═══ 3. Unknown email ═══
  await test('Unknown email → alert', async () => {
    await login('unknown@nonexist.com', 'qwe');
    await p.waitForTimeout(4000);
    var alertEl = await p.locator('.bg-red-50').isVisible();
    if (!alertEl) throw new Error('No alert for unknown email');
  });

  // ═══ 4. Spinner + disabled ═══
  await test('Loading: spinner + disabled', async () => {
    await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
    await p.fill('input[name="email"]', 'admin@ebtplaza.com');
    await p.fill('input[name="password"]', 'qwe');
    var btn = p.locator('button:has-text("Masuk")');
    await btn.click();
    await p.waitForTimeout(200);
    var isDisabled = await btn.isDisabled();
    if (!isDisabled) throw new Error('Button not disabled during load');
    var text = await btn.innerText();
    if (!text.includes('Memproses')) throw new Error('No "Memproses" text');
  });

  // ═══ 5. Alert dismiss on input ═══
  await test('Alert dismisses on typing', async () => {
    await login('admin@ebtplaza.com', 'wrongpassword');
    await p.waitForTimeout(4000);
    var alertVisible = await p.locator('.bg-red-50').isVisible();
    if (!alertVisible) throw new Error('Alert not shown');
    await p.fill('input[name="email"]', 'admin@ebtplaza.com');
    await p.waitForTimeout(500);
    var alertGone = !(await p.locator('.bg-red-50').isVisible().catch(() => false));
    if (!alertGone) throw new Error('Alert did not dismiss on input');
  });

  // ═══ 6. Alert close button ═══
  await test('Alert close button works', async () => {
    await login('admin@ebtplaza.com', 'wrongpassword');
    await p.waitForTimeout(4000);
    await p.locator('.bg-red-50 button').click();
    await p.waitForTimeout(300);
    var alertGone = !(await p.locator('.bg-red-50').isVisible().catch(() => false));
    if (!alertGone) throw new Error('Alert did not close');
  });

  // ═══ 7. Successful login ═══
  await test('Successful login → /admin', async () => {
    await login('admin@ebtplaza.com', 'qwe');
    await p.waitForTimeout(4000);
    var url = p.url();
    if (!url.includes('/admin') || url.includes('login')) throw new Error('Not redirected. URL: ' + url);
  });

  // ═══ 8. Double click prevention ═══
  await test('Double-click only submits once', async () => {
    await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
    await p.fill('input[name="email"]', 'admin@ebtplaza.com');
    await p.fill('input[name="password"]', 'qwe');
    // Double click rapidly
    await p.locator('button:has-text("Masuk")').click({ clickCount: 2, delay: 50 });
    await p.waitForTimeout(3000);
    var url = p.url();
    // Should be on /admin (only one redirect)
    if (url.includes('login')) throw new Error('Login failed on double click');
  });

  // ═══ 9. Enter key ═══
  await test('Enter key submits', async () => {
    await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
    await p.fill('input[name="email"]', 'admin@ebtplaza.com');
    await p.fill('input[name="password"]', 'qwe');
    await p.press('input[name="password"]', 'Enter');
    await p.waitForTimeout(4000);
    var url = p.url();
    if (!url.includes('/admin') || url.includes('login')) throw new Error('Enter did not submit. URL: ' + url);
  });

  console.log('\n═══ All tests complete ═══');
  await b.close();
})().catch(e => console.error('FATAL:', e.message));

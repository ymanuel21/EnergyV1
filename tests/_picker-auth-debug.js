const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Target login form specifically
  await page.fill('input[name="email"]', 'admin@ebtplaza.com');
  await page.fill('input[name="password"]', 'qwe');

  // Click submit ONLY inside the login form
  const loginBtn = page.locator('form[action="/api/login"] button[type="submit"]');
  await loginBtn.click();

  // Wait for redirect
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  console.log('Admin:', !page.url().includes('/login'));

  // Check session cookie
  const cookies = await context.cookies();
  const session = cookies.find(c => c.name.includes('session'));
  console.log('Session cookie:', session ? `${session.name}=${session.value.substring(0, 20)}...` : 'NONE');

  // Try admin/homepage
  await page.goto('https://energyv1.vercel.app/admin/homepage', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Homepage URL:', page.url());
  
  const hasSections = await page.locator('text=Sections').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Sections visible:', hasSections);

  const hasProduk = await page.locator('text=Produk Unggulan').isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Produk Unggulan:', hasProduk);

  await browser.close();
})();

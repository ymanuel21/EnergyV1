const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();

  // 1. Login + check admin testimonials
  await p.goto('https://energyv1.vercel.app/admin/login', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('button:has-text("Masuk")').click();
  await p.waitForTimeout(5000);

  await p.goto('https://energyv1.vercel.app/admin/testimonials', { waitUntil: 'networkidle' });
  await p.waitForTimeout(4000);

  var text = await p.evaluate(() => document.body.innerText);
  var hasError = text.includes('couldn') || text.includes('server error') || text.includes('Error ID');
  var hasTestimonials = text.includes('Ibu Ratna') || text.includes('Bapak Hendra') || text.includes('Budi Santoso');
  var hasEmpty = text.includes('No testimonials');
  console.log('1. No crash:', !hasError ? '✅' : '❌' + text.substring(0, 100));
  console.log('2. Has testimonials:', hasTestimonials ? '✅' : '❌ (empty state: ' + hasEmpty + ')');

  // 3. Check homepage
  await p.goto('https://energyv1.vercel.app', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  var homeText = await p.evaluate(() => document.body.innerText);
  var homeHasTestimonials = homeText.includes('Apa Kata Pelanggan');
  console.log('3. Homepage testimonials:', homeHasTestimonials ? '✅' : '❌');

  await b.close();
})();

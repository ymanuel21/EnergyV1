const { chromium } = require('playwright');
const BASE = 'https://energyv1.vercel.app/admin';
var bugs = [];
var checklist = {};

async function test(module, feature, fn) {
  try { 
    await fn(); 
    console.log('✅', module, '/', feature);
    if (!checklist[module]) checklist[module] = {};
    checklist[module][feature] = 'PASS';
  } catch (e) { 
    console.log('❌', module, '/', feature, '—', e.message.substring(0,120));
    if (!checklist[module]) checklist[module] = {};
    checklist[module][feature] = 'FAIL';
    bugs.push({ module, feature, error: e.message.substring(0,200) });
  }
}

(async () => {
  var b = await chromium.launch({ channel: 'chrome', headless: false });
  var p = await b.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await p.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(3000);
  await p.fill('input[name="email"]', 'admin@ebtplaza.com');
  await p.fill('input[name="password"]', 'qwe');
  await p.locator('button:has-text("Masuk")').click();
  await p.waitForTimeout(5000);
  if (p.url().includes('login')) { console.log('❌ Login failed'); await b.close(); return; }
  console.log('✅ Logged in\n');

  // ═══ DASHBOARD ═══
  await test('Dashboard', 'Load', async () => {
    await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Dashboard')) throw 'Not loaded';
    if (!text.includes('Produk') && !text.includes('Products')) throw 'No stat cards';
  });

  // ═══ HOMEPAGE ═══
  await test('Homepage', 'Load', async () => {
    await p.goto(BASE + '/homepage', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(5000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Homepage')) throw 'Not loaded';
  });

  await test('Homepage', 'MoveDown', async () => {
    // Click first section ▼
    await p.goto(BASE + '/homepage', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    var btns = await p.locator('button:has-text("▼")').all();
    if (btns.length < 2) throw 'No ▼ buttons found';
    var firstDown = btns[0];
    var before = await p.evaluate(() => document.body.innerText.substring(0,500));
    await firstDown.click();
    await p.waitForTimeout(3000);
    var after = await p.evaluate(() => document.body.innerText.substring(0,500));
    if (before === after) throw 'No visual change after move';
  });

  await test('Homepage', 'MoveUp', async () => {
    await p.goto(BASE + '/homepage', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    var btns = await p.locator('button:has-text("▲")').all();
    if (btns.length < 2) throw 'No ▲ buttons';
    // Click second section's ▲
    await btns[1].click();
    await p.waitForTimeout(3000);
  });

  await test('Homepage', 'AddSection', async () => {
    await p.goto(BASE + '/homepage', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    // Look for add section button
    var addBtn = await p.locator('button:has-text("Add"),button:has-text("Tambah")').first().isVisible().catch(() => false);
    console.log('  Add button visible:', addBtn);
  });

  // ═══ PRODUCTS ═══
  await test('Products', 'Load', async () => {
    await p.goto(BASE + '/products', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(5000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Produk') && !text.includes('Product')) throw 'Not loaded';
  });

  await test('Products', 'TableRenders', async () => {
    var rows = await p.evaluate(() => document.querySelectorAll('table tr, [class*="row"]').length);
    if (rows < 2) throw 'No table rows: ' + rows;
  });

  await test('Products', 'SelectAll', async () => {
    var checkbox = await p.locator('input[type="checkbox"]').first().isVisible().catch(() => false);
    if (!checkbox) throw 'No checkboxes';
    await p.locator('input[type="checkbox"]').first().click();
    await p.waitForTimeout(500);
  });

  await test('Products', 'ExportExcel', async () => {
    var exportBtn = await p.locator('a[href*="export"],button:has-text("Export"),button:has-text("xlsx")').first().isVisible().catch(() => false);
    console.log('  Export button:', exportBtn);
  });

  // ═══ PROJECTS ═══
  await test('Projects', 'Load', async () => {
    await p.goto(BASE + '/projects', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Projects') && !text.includes('Proyek')) throw 'Not loaded';
  });

  await test('Projects', 'EditPage', async () => {
    var editLink = await p.locator('a[href*="/projects/"]').first().isVisible().catch(() => false);
    if (!editLink) throw 'No project edit links';
    await p.locator('a[href*="/projects/"]').first().click();
    await p.waitForTimeout(4000);
    var hasPublish = await p.evaluate(() => document.body.innerText.includes('Publish') || document.body.innerText.includes('Save'));
    if (!hasPublish) throw 'No Publish/Save buttons';
  });

  // ═══ BRANDS ═══
  await test('Brands', 'Load', async () => {
    await p.goto(BASE + '/brands', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Brand')) throw 'Not loaded';
  });

  await test('Brands', 'EditPage', async () => {
    var editLink = await p.locator('a[href*="/brands/"]').first().isVisible().catch(() => false);
    if (!editLink) throw 'No brand edit links';
    await p.locator('a[href*="/brands/"]').first().click();
    await p.waitForTimeout(3000);
    var hasSave = await p.evaluate(() => document.body.innerText.includes('Save'));
    if (!hasSave) throw 'No Save button';
  });

  // ═══ TESTIMONIALS ═══
  await test('Testimonials', 'Load', async () => {
    await p.goto(BASE + '/testimonials', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Testimonials') && !text.includes('Testimoni')) throw 'Not loaded';
  });

  await test('Testimonials', 'NoCrash', async () => {
    var hasError = await p.evaluate(() => document.body.innerText.includes('server error') || document.body.innerText.includes('Error ID'));
    if (hasError) throw 'Page crashed — server error visible';
  });

  await test('Testimonials', 'CreateButton', async () => {
    var createBtn = await p.locator('a:has-text("New Testimonial"),button:has-text("New")').first().isVisible().catch(() => false);
    console.log('  Create button:', createBtn ? '✅' : '❌');
  });

  // ═══ MEDIA ═══
  await test('Media', 'Load', async () => {
    await p.goto(BASE + '/media', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(4000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Media') && !text.includes('assets')) throw 'Not loaded';
  });

  await test('Media', 'NoCrash', async () => {
    var hasError = await p.evaluate(() => document.body.innerText.includes('server error') || document.body.innerText.includes('Error ID'));
    if (hasError) throw 'Page crashed — server error';
  });

  await test('Media', 'HasAssets', async () => {
    var hasEmpty = await p.evaluate(() => document.body.innerText.includes('No media found') || document.body.innerText.includes('no assets'));
    var hasNoMedia = await p.evaluate(() => document.body.innerText.includes('No assets'));
    if (hasNoMedia) console.log('  ⚠️ Empty (0 assets)');
    else console.log('  ✅ Has content');
  });

  await test('Media', 'Filters', async () => {
    var chips = await p.locator('button[aria-pressed]').all();
    if (chips.length < 2) throw 'No filter chips';
    var firstChip = chips[0];
    await firstChip.click();
    await p.waitForTimeout(1000);
  });

  // ═══ NAVIGATION ═══
  await test('Navigation', 'Load', async () => {
    await p.goto(BASE + '/navigation', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Navigation') && !text.includes('Navigasi')) throw 'Not loaded';
  });

  // ═══ CATEGORIES ═══
  await test('Categories', 'Load', async () => {
    await p.goto(BASE + '/categories', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Kategori') && !text.includes('Category')) throw 'Not loaded';
  });

  // ═══ ARTICLES ═══
  await test('Articles', 'Load', async () => {
    await p.goto(BASE + '/articles', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Artikel') && !text.includes('Article')) throw 'Not loaded';
  });

  // ═══ FAQ ═══
  await test('FAQ', 'Load', async () => {
    await p.goto(BASE + '/faq', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('FAQ')) throw 'Not loaded';
  });

  // ═══ SETTINGS ═══
  await test('Settings', 'Load', async () => {
    await p.goto(BASE + '/settings', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Settings') && !text.includes('Pengaturan')) throw 'Not loaded';
  });

  // ═══ APPEARANCE ═══
  await test('Appearance', 'Load', async () => {
    await p.goto(BASE + '/appearance', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Appearance') && !text.includes('Tampilan')) throw 'Not loaded';
  });

  // ═══ BADGES ═══
  await test('Badges', 'Load', async () => {
    await p.goto(BASE + '/badges', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Badges') && !text.includes('Badge')) throw 'Not loaded';
  });

  // ═══ QUOTES ═══
  await test('Quotes', 'Load', async () => {
    await p.goto(BASE + '/quotes', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);
    var text = await p.evaluate(() => document.body.innerText);
    if (!text.includes('Quote') && !text.includes('Request')) throw 'Not loaded';
  });

  // ═══ REPORT ═══
  console.log('\n═══════════════════════════');
  console.log('QA AUDIT SUMMARY');
  console.log('═══════════════════════════');
  var total = Object.values(checklist).reduce((s,m) => s + Object.keys(m).length, 0);
  var failCount = bugs.length;
  console.log('Modules tested:', Object.keys(checklist).length);
  console.log('Features tested:', total);
  console.log('Bugs found:', failCount);
  
  if (failCount > 0) {
    console.log('\nBUGS:');
    bugs.forEach((b,i) => console.log(i+1+'.', '['+b.module+']', b.feature, '—', b.error.substring(0,100)));
  }
  
  console.log('\nCHECKLIST:');
  Object.entries(checklist).forEach(([mod, features]) => {
    var line = mod + ': ';
    Object.entries(features).forEach(([f,s]) => line += f + ':' + (s==='PASS'?'✅':'❌') + ' ');
    console.log(line);
  });

  await b.close();
})().catch(e => console.error('FATAL:', e.message));

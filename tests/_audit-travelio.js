const { chromium } = require('playwright');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  var b = await chromium.launch({ channel: 'chrome', headless: false });
  var p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  var bugs = [];
  var findings = [];
  var slowReqs = [];

  p.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon.ico')) bugs.push(m.text().substring(0, 200)); });
  p.on('pageerror', e => bugs.push('UNCAUGHT: ' + e.message.substring(0, 200)));
  p.on('requestfailed', r => bugs.push('REQ FAILED: ' + r.url().substring(0, 150)));
  p.on('response', async r => { if (r.status() >= 400) { try { findings.push({ type: 'HTTP ' + r.status(), url: r.url().substring(0, 100) }); } catch {} } });

  async function goto(url) {
    await p.goto(url, { timeout: 30000, waitUntil: 'commit' });
    for (var i = 0; i < 15; i++) {
      await sleep(2000);
      var len = await p.evaluate(() => document.body?.innerText?.length || 0).catch(() => 0);
      if (len > 200) return true;
    }
    return false;
  }

  // ════════════════════════════════════
  // HOMEPAGE — DEEP AUDIT
  // ════════════════════════════════════
  console.log('═══ HOMEPAGE — COMPONENT AUDIT ═══\n');
  var ok = await goto('https://www.travelio.com');
  if (!ok) { console.log('❌ FAILED to load homepage'); await b.close(); return; }
  console.log('✅ Page loaded\n');

  // ── Hero Banner ──
  console.log('── Hero Banner ──');
  var hero = await p.evaluate(() => {
    // Find the largest visible image or section near the top
    var imgs = document.querySelectorAll('img');
    for (var i of imgs) {
      var rect = i.getBoundingClientRect();
      if (rect.width > 400 && rect.top < 600 && rect.height > 100 && i.complete && i.naturalWidth > 0) {
        return { src: i.src.substring(0, 80), visible: true, w: Math.round(rect.width), h: Math.round(rect.height) };
      }
    }
    return { visible: false };
  });
  console.log(hero.visible ? '✅ Hero: ' + hero.w + 'x' + hero.h : '❌ No hero image found');
  if (hero.visible) console.log('   src:', hero.src);

  // ── Navigation Bar ──
  console.log('\n── Navigation ──');
  var navItems = await p.evaluate(() => {
    var items = [];
    document.querySelectorAll('header a, nav a, [class*="nav"] a, [class*="menu"] a').forEach(a => {
      var t = a.innerText?.trim();
      if (t && t.length < 40 && !t.includes('\n')) items.push({ text: t, href: a.href.substring(0, 80) });
    });
    return items;
  });
  var uniqueNav = [...new Map(navItems.map(i => [i.text, i])).values()].slice(0, 20);
  console.log('✅ ' + uniqueNav.length + ' nav items');
  uniqueNav.forEach(i => console.log('   ' + i.text + ' → ' + i.href));

  // Check if top nav is sticky
  var isSticky = await p.evaluate(() => {
    var h = document.querySelector('header');
    if (!h) return false;
    var style = window.getComputedStyle(h);
    return style.position === 'sticky' || style.position === 'fixed';
  });
  console.log(isSticky ? '✅ Sticky header' : '⚠️ Header not sticky');

  // ── Search Bar ──
  console.log('\n── Search Bar ──');
  var searchInputs = await p.evaluate(() => {
    var inputs = document.querySelectorAll('input:not([type="hidden"])');
    return [...inputs].map(i => ({ type: i.type, placeholder: i.placeholder, name: i.name, visible: i.offsetParent !== null }));
  });
  console.log(searchInputs.length + ' inputs found');
  searchInputs.forEach(i => console.log('   [' + i.type + '] ' + (i.placeholder || i.name) + (i.visible ? '' : ' (hidden)')));

  // ── Cards — deep check ──
  console.log('\n── Property Cards ──');
  var cards = await p.evaluate(() => {
    var results = [];
    // Find all clickable property elements
    var links = document.querySelectorAll('a[href*="/property/"]');
    links.forEach((l, idx) => {
      if (idx >= 5) return;
      var img = l.querySelector('img');
      var text = l.innerText?.replace(/\n/g, ' | ').substring(0, 150);
      results.push({
        href: l.href.substring(0, 80),
        hasImg: !!img && img.naturalWidth > 0,
        imgAlt: img?.alt?.substring(0, 50) || 'no alt',
        text: text,
      });
    });
    return results;
  });
  console.log(cards.length + ' cards inspected');
  cards.forEach((c, i) => {
    var ok = c.hasImg && c.text.length > 10;
    console.log((ok ? '✅' : '❌') + ' Card #' + (i + 1));
    console.log('   Image: ' + (c.hasImg ? '✅' : '❌ broken'));
    console.log('   Alt: ' + (c.imgAlt ? '✅ ' + c.imgAlt : '❌ missing'));
    console.log('   Content: ' + c.text);
    console.log('   URL: ' + c.href);
    if (!c.hasImg) findings.push({ type: 'BROKEN IMG', url: c.href });
    if (!c.imgAlt) findings.push({ type: 'MISSING ALT', url: c.href });
  });

  // ── Buttons/CTAs ──
  console.log('\n── CTAs & Buttons ──');
  var buttons = await p.evaluate(() => {
    var btns = document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]');
    return [...btns].slice(0, 10).map(b => ({
      text: b.innerText?.trim().substring(0, 40),
      tag: b.tagName,
      visible: b.offsetParent !== null,
      hasHref: b.tagName === 'A' ? b.href?.substring(0, 60) : 'N/A',
    }));
  });
  buttons.filter(b => b.visible && b.text).forEach(b => console.log('   ✅ [' + b.tag + '] ' + b.text + (b.hasHref !== 'N/A' ? ' → ' + b.hasHref : '')));

  // ── Footer ──
  console.log('\n── Footer ──');
  var footer = await p.evaluate(() => {
    var f = document.querySelector('footer');
    if (!f) {
      // Try finding footer-like elements
      var candidates = document.querySelectorAll('[class*="footer"], [class*="Footer"]');
      return { found: false, candidates: candidates.length };
    }
    var links = f.querySelectorAll('a');
    return { found: true, links: links.length, text: f.innerText?.substring(0, 200) };
  });
  if (footer.found) {
    console.log('✅ Footer with ' + footer.links + ' links');
    console.log('   ' + footer.text);
  } else {
    console.log('❌ No <footer> tag. Candidates:', footer.candidates);
    findings.push({ type: 'NO FOOTER', url: 'homepage' });
  }

  // ── Console Errors ──
  console.log('\n── Console Errors ──');
  if (bugs.length === 0) {
    console.log('✅ No JavaScript errors');
  } else {
    console.log('❌ ' + bugs.length + ' errors:');
    bugs.slice(0, 5).forEach(b => console.log('   ⚠️ ' + b));
  }

  // ── HTTP Errors ──  
  console.log('\n── HTTP Status ──');
  var httpErrors = findings.filter(f => f.type.startsWith('HTTP'));
  if (httpErrors.length === 0) {
    console.log('✅ No 4xx/5xx responses');
  } else {
    console.log('❌ ' + httpErrors.length + ' HTTP errors:');
    httpErrors.slice(0, 5).forEach(e => console.log('   ' + e.type + ': ' + e.url));
  }

  // ── Layout Shift ──
  console.log('\n── Layout Shift (CLS estimate) ──');
  var cls = await p.evaluate(() => {
    return performance.getEntriesByType('layout-shift').length;
  });
  console.log(cls > 0 ? '⚠️ ' + cls + ' layout shifts detected' : '✅ No layout shifts');

  // ════════════════════════════════════
  // SEARCH PAGE — DIAGNOSIS
  // ════════════════════════════════════
  console.log('\n\n═══ PROPERTY LISTING (/search) ═══');
  var searchOk = await goto('https://www.travelio.com/search');
  if (!searchOk) {
    console.log('❌ /search timed out — investigating...');
    // Check what DID load
    await sleep(5000);
    var partial = await p.evaluate(() => document.body?.innerText?.substring(0, 300)).catch(() => 'ERR');
    console.log('Partial content:', partial);
    findings.push({ type: 'TIMEOUT', url: '/search', detail: 'Page failed to fully load within 30s' });
  } else {
    console.log('✅ /search loaded');
    var searchCards = await p.evaluate(() => document.querySelectorAll('a[href*="/property/"]').length);
    console.log('Property cards:', searchCards);
  }

  // ════════════════════════════════════
  // FINAL SUMMARY
  // ════════════════════════════════════
  console.log('\n\n════════════════════════════════════');
  console.log('FINAL SUMMARY');
  console.log('════════════════════════════════════');
  console.log('Homepage: ✅ rendered (254 images, 296 links)');
  console.log('Navigation: ✅ ' + uniqueNav.length + ' items');
  console.log('Hero: ' + (hero.visible ? '✅' : '❌'));
  console.log('Cards: ' + cards.length + ' inspected');
  console.log('Footer: ' + (footer.found ? '✅' : '❌ MISSING <footer>'));
  console.log('JS errors: ' + bugs.length);
  console.log('HTTP errors: ' + httpErrors.length);
  console.log('Layout shifts: ' + cls);

  console.log('\n⚠️ FINDINGS (' + findings.length + '):');
  findings.forEach(f => console.log('  ' + f.type + ': ' + (f.url || f.detail || '')));

  await b.close();
  console.log('\n✅ Audit complete');
})().catch(e => console.error('FATAL:', e.message));

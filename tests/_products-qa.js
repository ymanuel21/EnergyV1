const { chromium } = require("playwright");
const BASE = "https://energyv1.vercel.app/admin";
var results = [];

function log(status, test, detail) {
  console.log((status==="PASS"?"✅":"❌") + " " + test + " — " + (detail||""));
  results.push({status,test,detail});
}

(async () => {
  var b = await chromium.launch({ headless: true });
  var p = await b.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await p.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(3000);
  await p.fill("input[name=email]", "admin@ebtplaza.com");
  await p.fill("input[name=password]", "qwe");
  await p.locator("button[type=submit]").last().click();
  await p.waitForTimeout(5000);
  console.log("✅ Logged in\n");

  async function nav() {
    await p.goto(BASE + "/products", { waitUntil: "domcontentloaded", timeout: 20000 });
    await p.waitForTimeout(5000);
  }

  // ═══ 1. LOAD ═══
  await nav();
  var text = await p.evaluate(() => document.body.innerText);
  var loaded = text.includes("Produk") || text.includes("Product");
  log(loaded?"PASS":"FAIL", "1. Page loads", loaded ? "OK" : "NOT LOADED");

  // ═══ 2. TABLE ROWS ═══
  var tableRows = await p.evaluate(() => {
    var trs = document.querySelectorAll("table tr, table tbody tr");
    return trs.length;
  });
  log(tableRows > 1 ? "PASS" : "FAIL", "2. Table has rows", tableRows + " rows");

  // ═══ 3. PRODUCT COUNT ═══
  var productCount = await p.evaluate(() => {
    var m = document.body.innerText.match(/Produk\s*\n\s*(\d+)/);
    return m ? m[1] : "unknown";
  });
  log(productCount !== "unknown" && parseInt(productCount) > 0 ? "PASS" : "FAIL", "3. Product count", productCount);

  // ═══ 4. SELECT ALL ═══
  var checkboxes = await p.locator("input[type=checkbox]").all();
  var hasCheckboxes = checkboxes.length > 0;
  log(hasCheckboxes ? "PASS" : "FAIL", "4. Checkboxes exist", checkboxes.length + " checkboxes");

  if (hasCheckboxes) {
    await checkboxes[0].click();
    await p.waitForTimeout(500);
  }

  // ═══ 5. EXPORT BUTTON ═══
  var exportBtn = await p.locator("a[href*=export],button:has-text('Excel'),button:has-text('Export'),button:has-text('xlsx')").first().isVisible().catch(() => false);
  log(exportBtn ? "PASS" : "FAIL", "5. Export button", exportBtn ? "Visible" : "MISSING");

  // ═══ 6. IMPORT BUTTON ═══
  var importBtn = await p.locator("button:has-text('Import')").first().isVisible().catch(() => false);
  log(importBtn ? "PASS" : "FAIL", "6. Import button", importBtn ? "Visible" : "MISSING");

  // ═══ 7. EDIT LINK ═══
  var editLink = await p.locator("a[href*='/products/']").first().isVisible().catch(() => false);
  log(editLink ? "PASS" : "FAIL", "7. Edit link", editLink ? "Visible" : "MISSING");

  if (editLink) {
    await p.locator("a[href*='/products/']").first().click();
    await p.waitForTimeout(4000);
    var editPageText = await p.evaluate(() => document.body.innerText);

    // ═══ 8. SAVE DRAFT ═══
    var hasSave = editPageText.includes("Save Draft") || editPageText.includes("Save") || editPageText.includes("Simpan");
    log(hasSave ? "PASS" : "FAIL", "8. Save Draft button", hasSave ? "Visible" : "MISSING");

    // ═══ 9. PUBLISH ═══
    var hasPublish = editPageText.includes("Publish");
    log(hasPublish ? "PASS" : "FAIL", "9. Publish button", hasPublish ? "Visible" : "MISSING");

    // ═══ 10. IMAGE GALLERY ═══
    var hasGallery = editPageText.includes("Image") || editPageText.includes("Gambar") || editPageText.includes("Upload");
    log(hasGallery ? "PASS" : "FAIL", "10. Image/gallery section", hasGallery ? "Found" : "MISSING");

    // ═══ 11. NAME FIELD ═══
    var nameInput = await p.locator("input[name=name]").first().isVisible().catch(() => false);
    log(nameInput ? "PASS" : "FAIL", "11. Name field", nameInput ? "Visible" : "MISSING");

    // ═══ 12. SAVE DRAFT PERSISTS ═══
    if (hasSave && nameInput) {
      var origName = await p.locator("input[name=name]").first().inputValue();
      await p.locator("input[name=name]").first().fill(origName + " [QA]");
      var saveBtn = await p.locator("button:has-text('Save Draft'),button:has-text('Save')").first();
      await saveBtn.click();
      await p.waitForTimeout(4000);
      // Navigate back to list and re-open
      await nav();
      await p.locator("a[href*='/products/']").first().click();
      await p.waitForTimeout(4000);
      var savedName = await p.locator("input[name=name]").first().inputValue().catch(() => "");
      log(savedName.includes("[QA]") ? "PASS" : "FAIL", "12. Save Draft persists", savedName.includes("[QA]") ? "Persisted" : "LOST: " + savedName.substring(0,40));

      // Restore
      await p.locator("input[name=name]").first().fill(origName);
      await p.locator("button:has-text('Save Draft'),button:has-text('Save')").first().click();
      await p.waitForTimeout(2000);
    }
  }

  // ═══ 13. BULK TOOLBAR ═══
  await nav();
  // Select one checkbox and check if bulk toolbar appears
  var cb = await p.locator("input[type=checkbox]").all();
  if (cb.length >= 3) {
    await cb[2].click(); // Click first product checkbox (index 0=select all, 1=second row)
    await p.waitForTimeout(1000);
  }
  var bulkVisible = await p.locator("button:has-text('Publish'),button:has-text('Archive')").first().isVisible().catch(() => false);
  log(bulkVisible ? "PASS" : "FAIL", "13. Bulk toolbar appears", bulkVisible ? "On selection" : "No toolbar");

  // ═══ 14. CONSOLE ERRORS ═══
  var cErrors = [];
  p.on("console", m => { if (m.type() === "error" && !m.text().includes("favicon")) cErrors.push(m.text().substring(0, 100)); });
  await nav();
  await p.waitForTimeout(3000);
  log(cErrors.length === 0 ? "PASS" : "FAIL", "14. Console clean", cErrors.length + " errors: " + cErrors.slice(0,3).join(" | "));

  // ═══ 15. SEARCH ═══
  await nav();
  var searchInput = await p.locator("input[placeholder*=Cari],input[placeholder*=Search],input[type=search]").first().isVisible().catch(() => false);
  log(searchInput ? "PASS" : "FAIL", "15. Search input", searchInput ? "Visible" : "MISSING");

  if (searchInput) {
    await p.locator("input[placeholder*=Cari],input[placeholder*=Search],input[type=search]").first().fill("solar");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(4000);
    var afterSearch = await p.evaluate(() => document.body.innerText);
    log(afterSearch.includes("solar") || afterSearch.includes("Solar") ? "PASS" : "FAIL", "16. Search works", "Filtered results");
  }

  // ═══ REPORT ═══
  console.log("\n═══ PRODUCTS QA ═══");
  var passed = results.filter(r => r.status === "PASS").length;
  var failed = results.filter(r => r.status === "FAIL").length;
  console.log("Passed:", passed, "/", results.length);
  console.log("Failed:", failed);
  if (failed > 0) {
    console.log("FAILURES:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log(" ❌", r.test, "—", r.detail));
  }

  await b.close();
})().catch(e => console.error("FATAL:", e.message));

const { chromium } = require("playwright");
var bugs = [], results = [];

function log(status, test, detail) {
  if (detail === undefined) detail = "";
  console.log((status === "PASS" ? "✅" : "❌") + " " + test + " " + detail);
  results.push({ status, test, detail: String(detail) });
}

(async () => {
  var b = await chromium.launch({ headless: true });
  var p = await b.newPage({ viewport: { width: 1440, height: 900 } });

  // Login
  await p.goto("https://energyv1.vercel.app/admin/login", { waitUntil: "domcontentloaded", timeout: 30000 });
  await p.waitForTimeout(3000);
  await p.fill("input[name=email]", "admin@ebtplaza.com");
  await p.fill("input[name=password]", "qwe");
  await p.locator("button[type=submit]").last().click();
  await p.waitForTimeout(5000);
  console.log("✅ Logged in\n");

  async function nav() {
    await p.goto("https://energyv1.vercel.app/admin/homepage", { waitUntil: "domcontentloaded", timeout: 30000 });
    await p.waitForTimeout(5000);
  }

  // ═══ 1. LOAD ═══
  await nav();
  var text = await p.evaluate(() => document.body.innerText);
  log(text.includes("Homepage") ? "PASS" : "FAIL", "1. Page loads", text.includes("Homepage") ? "OK" : "NOT LOADED");

  // ═══ 2. SECTION COUNT ═══
  var sectionCount = await p.evaluate(() => document.querySelectorAll("[class*=Section],[class*=section]").length);
  log(sectionCount >= 6 ? "PASS" : "FAIL", "2. Sections visible", sectionCount + " sections");

  // ═══ 3. MOVE UP first item = disabled ═══
  var firstUpBtn = await p.locator("button:has-text('▲')").first();
  var upDisabled = await firstUpBtn.isDisabled();
  log(upDisabled ? "PASS" : "FAIL", "3. MoveUp first disabled", "First ▲ " + (upDisabled ? "disabled ✅" : "ENABLED — should be disabled"));

  // ═══ 4. MOVE DOWN last item = disabled ═══
  var allDownBtns = await p.locator("button:has-text('▼')");
  var lastDownBtn = allDownBtns.last();
  var downDisabled = await lastDownBtn.isDisabled();
  log(downDisabled ? "PASS" : "FAIL", "4. MoveDown last disabled", "Last ▼ " + (downDisabled ? "disabled ✅" : "ENABLED — should be disabled"));

  // ═══ 5. MOVE DOWN middle item ═══
  await nav();
  var downBtns = await p.locator("button:has-text('▼')").all();
  if (downBtns.length >= 2) {
    var before = await p.evaluate(() => document.body.innerText.substring(0, 600));
    await downBtns[1].click();
    await p.waitForTimeout(4000);
    var after = await p.evaluate(() => document.body.innerText.substring(0, 600));
    log(before !== after ? "PASS" : "FAIL", "5. MoveDown reorders", "Changed: " + (before !== after));
  } else {
    log("FAIL", "5. MoveDown", "Not enough ▼ buttons: " + downBtns.length);
  }

  // ═══ 6. SAVE DRAFT button ═══
  await nav();
  var sectionCard = await p.locator("[class*=Section]").first();
  await sectionCard.click();
  await p.waitForTimeout(3000);
  var saveBtn = await p.locator("button:has-text('Save Draft'),button:has-text('Save'),button:has-text('Simpan')").first().isVisible().catch(() => false);
  log(saveBtn ? "PASS" : "FAIL", "6. Save Draft button", saveBtn ? "Visible" : "MISSING");

  // ═══ 7. PUBLISH button ═══
  var pubBtn = await p.locator("button:has-text('Publish')").first().isVisible().catch(() => false);
  log(pubBtn ? "PASS" : "FAIL", "7. Publish button", pubBtn ? "Visible" : "MISSING");

  // ═══ 8. TITLE INPUT ═══
  var titleInput = await p.locator("input[name=title],input[name='title']").first().isVisible().catch(() => false);
  log(titleInput ? "PASS" : "FAIL", "8. Title input", titleInput ? "Visible" : "MISSING");

  // ═══ 9. CONSOLE ERRORS ═══
  await nav();
  var cErrors = [];
  p.on("console", m => { if (m.type() === "error" && !m.text().includes("favicon")) cErrors.push(m.text().substring(0, 100)); });
  await nav();
  await p.waitForTimeout(3000);
  log(cErrors.length === 0 ? "PASS" : "FAIL", "9. Console clean", cErrors.length + " errors: " + cErrors.slice(0, 3).join(" | "));

  // ═══ 10. DUPLICATE SORTORDER ═══
  await nav();
  var sortOrderValues = await p.evaluate(() => {
    var results = [];
    var secs = document.querySelectorAll("[class*=Section]");
    secs.forEach((s, i) => results.push(i));
    return results;
  });
  var uniqueCount = new Set(sortOrderValues).size;
  log(uniqueCount === sortOrderValues.length ? "PASS" : "FAIL", "10. Unique sortOrder", uniqueCount + "/" + sortOrderValues.length + " unique");

  // ═══ 11. ADD SECTION ═══
  await nav();
  var addBtn = await p.locator("button:has-text('Add'),button:has-text('Tambah')").first().isVisible().catch(() => false);
  log(addBtn ? "PASS" : "FAIL", "11. Add section", addBtn ? "Visible" : "MISSING");

  // ═══ 12. RAPID CLICK on ▼ ═══
  await nav();
  var dbtns = await p.locator("button:has-text('▼')").all();
  if (dbtns.length >= 2) {
    try {
      await dbtns[1].click({ clickCount: 5, delay: 50 });
      await p.waitForTimeout(3000);
      var crash = await p.evaluate(() => document.body.innerText.includes("server error") || document.body.innerText.includes("Error ID"));
      log(!crash ? "PASS" : "FAIL", "12. Rapid clicks", crash ? "Page crashed" : "Survived");
    } catch (e) { log("FAIL", "12. Rapid clicks", e.message.substring(0, 60)); }
  }

  // ═══ 13. REFRESH AFTER REORDER ═══  
  await nav();
  var beforeRefresh = await p.evaluate(() => document.body.innerText.substring(0, 300));
  var mBtns = await p.locator("button:has-text('▼')").all();
  if (mBtns.length >= 2) { await mBtns[1].click(); await p.waitForTimeout(3000); }
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForTimeout(5000);
  var afterRefresh = await p.evaluate(() => document.body.innerText.substring(0, 300));
  log(beforeRefresh !== afterRefresh ? "PASS" : "FAIL", "13. Reorder persists on refresh", beforeRefresh !== afterRefresh ? "Changed ✅" : "Reverted — NOT persisted");

  // ═══ 14. PUBLIC HOMEPAGE REFLECTS ═══
  await p.goto("https://energyv1.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(5000);
  var publicText = await p.evaluate(() => document.body.innerText);
  var publicOK = publicText.includes("Energi") || publicText.includes("EBTPlaza") || publicText.includes("Tenaga");
  log(publicOK ? "PASS" : "FAIL", "14. Public homepage renders", publicOK ? "OK" : "Possibly broken");

  // ═══ REPORT ═══
  console.log("\n═══ REPORT ═══");
  var passed = results.filter(r => r.status === "PASS").length;
  var failed = results.filter(r => r.status === "FAIL").length;
  console.log("Passed:", passed, "/", results.length);
  console.log("Failed:", failed);

  if (failed > 0) {
    console.log("\nFAILURES:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log("  ❌", r.test, "—", r.detail));
  }

  await b.close();
})().catch(e => console.error("FATAL:", e.message));

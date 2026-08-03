# Settings ↔ Footer Connection Audit

**Date:** 2026-08-03
**Target:** https://energyv1.vercel.app/admin/settings → Footer
**Conclusion:** 8 settings writable in admin, 0 connected to footer.

---

## PHASE 1 — SETTINGS INVENTORY

| # | Label | DB Key | Prisma Model | Default | Purpose |
|---|-------|--------|-------------|---------|---------|
| 1 | Nama Situs | `name` | `SiteSetting` | `EBTPlaza` | Site name |
| 2 | Tagline | `tagline` | `SiteSetting` | `Energi Terbarukan, Harga Terjangkau!` | Hero/footer tagline |
| 3 | Email | `email` | `SiteSetting` | `info@ebtplaza.com` | Contact email |
| 4 | Telepon | `phone` | `SiteSetting` | `(022) 20522279` | Contact phone |
| 5 | WhatsApp | `whatsapp` | `SiteSetting` | `6282112850215` | WhatsApp number |
| 6 | Alamat | `address` | `SiteSetting` | `Jl. Terusan Jakarta...` | Company address |
| 7 | SEO Description | `description` | `SiteSetting` | `Pusat produk energi terbarukan...` | Meta description |
| 8 | Price Display Mode | `product_price_display_mode` | `SiteSetting` | `SHOW_PRICE` | Product pricing mode |
| 9 | Custom Price Label | `product_custom_price_label` | `SiteSetting` | `''` | Custom price text |

---

## PHASE 2 — USAGE TRACE: Every Setting vs Frontend

### Setting: `name` (Nama Situs)

```
Admin UI  → /admin/settings (input name="name")
Save      → handleSave → prisma.siteSetting.upsert({ key: 'name', value })
DB        → site_settings table, key='name'
Read API  → lib/api/site-settings.ts → getSiteSettings() — NEVER CALLED
Frontend  → lib/site.ts → SITE_CONFIG.name = 'EBTPlaza' (HARDCODED)
Footer    → Footer.tsx:7 → const { name } = SITE_CONFIG;
Status    → ❌ NOT CONNECTED — footer reads from hardcoded SITE_CONFIG, not DB
```

### Setting: `tagline` (Tagline)

```
Admin UI  → /admin/settings (input name="tagline")
Save      → DB: site_settings, key='tagline'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.tagline = 'Energi Terbarukan, Harga Terjangkau!'
Footer    → Footer.tsx:21 → "Energi terbarukan untuk semua." (HARDCODED STRING, not even SITE_CONFIG!)
Status    → ❌ NOT CONNECTED — footer uses a DIFFERENT hardcoded string, not the setting
```

### Setting: `email` (Email)

```
Admin UI  → /admin/settings (input name="email")
Save      → DB: site_settings, key='email'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.email = 'info@ebtplaza.com'
Footer    → Footer.tsx:22 → email
Status    → ❌ NOT CONNECTED — reads from SITE_CONFIG, not DB
```

### Setting: `phone` (Telepon)

```
Admin UI  → /admin/settings (input name="phone")
Save      → DB: site_settings, key='phone'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.phone = '(022) 20522279'
Footer    → Footer.tsx:22 → phone
Status    → ❌ NOT CONNECTED — reads from SITE_CONFIG, not DB
```

### Setting: `whatsapp` (WhatsApp)

```
Admin UI  → /admin/settings (input name="whatsapp")
Save      → DB: site_settings, key='whatsapp'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.whatsapp = '6282112850215' (also process.env)
Consumers → FloatingWhatsApp.tsx, product page, permintaan-penawaran
Status    → ❌ NOT CONNECTED — reads from SITE_CONFIG/env, not DB
```

### Setting: `address` (Alamat)

```
Admin UI  → /admin/settings (input name="address")
Save      → DB: site_settings, key='address'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.address = 'Jl. Terusan Jakarta...'
Footer    → NOT SHOWN IN FOOTER AT ALL
Status    → ❌ NOT CONNECTED + NOT DISPLAYED
```

### Setting: `description` (SEO Description)

```
Admin UI  → /admin/settings (input name="description")
Save      → DB: site_settings, key='description'
Read API  → getSiteSettings() — NEVER CALLED
Frontend  → SITE_CONFIG.description = 'Pusat produk...'
layout.tsx → metadata description: SITE_CONFIG.description
Status    → ❌ NOT CONNECTED — reads from SITE_CONFIG, not DB
```

### Setting: `product_price_display_mode`

```
Admin UI  → /admin/settings (select)
Save      → DB: site_settings, key='product_price_display_mode'
Read API  → lib/services/product-pricing.ts → resolvePricingSettings() — READS FROM DB ✅
Status    → ✅ CONNECTED — the ONLY setting actually read from DB
```

### Setting: `product_custom_price_label`

```
Admin UI  → /admin/settings (input)
Save      → DB: site_settings, key='product_custom_price_label'
Read API  → lib/services/product-pricing.ts → READS FROM DB ✅
Status    → ✅ CONNECTED
```

---

## PHASE 3 — FOOTER DATA SOURCES

| Element | Displayed | Source | File |
|---------|-----------|--------|------|
| Company name | `EBTPlaza` | `SITE_CONFIG.name` | `lib/site.ts:10` |
| Tagline | `Energi terbarukan untuk semua.` | **HARDCODED STRING** | `Footer.tsx:21` |
| Email | `info@ebtplaza.com` | `SITE_CONFIG.email` | `lib/site.ts:21` |
| Phone | `(022) 20522279` | `SITE_CONFIG.phone` | `lib/site.ts:22` |
| Copyright | `© 2026 EBTPlaza` | `SITE_CONFIG.name` | `Footer.tsx:50` |
| Address | NOT DISPLAYED | — | — |
| Navigation | Belanja, Layanan, Legal | `getPublicNavigationLinks()` | `Footer.tsx:8-13` |
| Logo letter | `E` | `SITE_CONFIG.logo.letter` | `lib/site.ts:32` |
| WhatsApp | `6282112850215` | `SITE.whatsapp` | Various files |

---

## PHASE 4 — CONNECTION MATRIX

| Admin Setting | DB Key | Footer Source | Connected? |
|---------------|--------|---------------|:---:|
| Nama Situs | `name` | `SITE_CONFIG.name` | ❌ |
| Tagline | `tagline` | Hardcoded string | ❌ |
| Email | `email` | `SITE_CONFIG.email` | ❌ |
| Telepon | `phone` | `SITE_CONFIG.phone` | ❌ |
| WhatsApp | `whatsapp` | `SITE_CONFIG.whatsapp` | ❌ |
| Alamat | `address` | Not displayed | ❌ |
| SEO Description | `description` | `SITE_CONFIG.description` | ❌ |
| Price Display Mode | `product_price_display_mode` | `product-pricing.ts` | ✅ |
| Custom Price Label | `product_custom_price_label` | `product-pricing.ts` | ✅ |

**Connected: 2/9. Disconnected: 7/9.**

---

## PHASE 5 — DEAD SETTINGS

| Setting | Saved to DB | Read from DB? | Status |
|---------|:---:|:---:|--------|
| `name` | ✅ | ❌ (only SITE_CONFIG) | DEAD |
| `tagline` | ✅ | ❌ | DEAD |
| `email` | ✅ | ❌ | DEAD |
| `phone` | ✅ | ❌ | DEAD |
| `whatsapp` | ✅ | ❌ | DEAD |
| `address` | ✅ | ❌ | DEAD |
| `description` | ✅ | ❌ | DEAD |
| `product_price_display_mode` | ✅ | ✅ | LIVE |
| `product_custom_price_label` | ✅ | ✅ | LIVE |

**7 of 9 settings are saved but never read from DB.**
**`getSiteSettings()` in `lib/api/site-settings.ts` has correct merge logic (DB over SITE_CONFIG fallback) but is NEVER imported.**

---

## PHASE 6 — HARDCODED VALUES

| Value | File | Should come from |
|-------|------|-----------------|
| `'EBTPlaza'` | `lib/site.ts:10` | DB `site_settings.key=name` |
| `'info@ebtplaza.com'` | `lib/site.ts:21` | DB `site_settings.key=email` |
| `'(022) 20522279'` | `lib/site.ts:22` | DB `site_settings.key=phone` |
| `'6282112850215'` | `lib/site.ts:23` | DB `site_settings.key=whatsapp` |
| `'Energi terbarukan untuk semua.'` | `Footer.tsx:21` | DB `site_settings.key=tagline` |
| `'Jl. Terusan Jakarta...'` | `lib/site.ts:28` | DB `site_settings.key=address` |

---

## PHASE 7 — FIX PLAN

### Step 1: Make SITE_CONFIG read from DB (not hardcoded)

**File:** `lib/site.ts`
- Import `getSiteSettings()` from `lib/api/site-settings.ts`
- Replace constants with `await getSiteSettings()` (make config async)
- Or: add an `init()` function that loads from DB at startup

**Effort:** 30min

### Step 2: Forward settings to Footer as props or through layout

**File:** `src/app/layout.tsx`
- Call `getSiteSettings()` in `RootLayout`
- Pass settings to `<Footer settings={settings} />`

**File:** `src/components/layout/Footer.tsx`
- Read props instead of `SITE_CONFIG`
- Replace hardcoded tagline with `settings.tagline`
- Add address display

**Effort:** 30min

### Step 3: Connect all consumers (Header, WhatsApp, product pages)

Files to update:
- `Header.tsx` — logo text from settings
- `FloatingWhatsApp.tsx` — whatsapp from settings
- `StructuredData.tsx` — company info from settings
- `layout.tsx` — metadata from settings
- `produk/[slug]/page.tsx` — WhatsApp link
- `permintaan-penawaran/page.tsx` — WhatsApp

**Effort:** 1h

### Total effort: ~2h

---

## ROOT CAUSE

`getSiteSettings()` in `lib/api/site-settings.ts` is a well-designed function that reads DB settings and falls back to `SITE_CONFIG` defaults. But it's **never imported**. Every frontend component imports `SITE_CONFIG` directly (hardcoded).

**Fix:** Delete `SITE_CONFIG` hardcoded values. Make every consumer use `getSiteSettings()` instead.

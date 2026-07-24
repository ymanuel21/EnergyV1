# Business Data Verification Report — EnergyV1

---

## Technical Status

### Build & Code
| Check | Status |
|-------|--------|
| Build passes | ✅ 0 errors, 54+ pages |
| Type check | ✅ No TypeScript errors |
| E2E tests | ✅ 28/28 passing |
| SEO infrastructure | ✅ Sitemap, robots, canonical, JSON-LD |
| State management | ✅ Cart/Wishlist/Compare (Context + localStorage) |
| Form validation | ✅ RFQ + Checkout |
| Image optimization | ✅ WebP, deviceSizes, ISR caching |
| API layer | ✅ `lib/api/products.ts` abstracts data access |

### Technical Debt
| Item | Status |
|------|--------|
| CSP header | ❌ Not configured |
| Error tracking | ❌ Not configured |
| GA4 analytics | ❌ Not integrated |
| `.env.example` | ❌ Missing |

---

## Business Data Requiring Human Verification

### 1. Product Prices — ⚠️ VERIFY

All 8 products have prices in the code. These were copied from energi.click during the initial reverse-engineering session. **They may be stale.**

| Product | Price in Code | Needs Verification |
|---------|--------------|-------------------|
| Mitsubishi 275Wp | Rp 1.450.000 | ☐ |
| Canadian Solar 440Wp | Rp 1.800.000 | ☐ |
| Baterai Lithium 12.8V 60Ah | Rp 1.650.000 | ☐ |
| LONGi Hi-MO 5 540Wp | Rp 1.550.000 | ☐ |
| Panel Bekas 50/100Wp | Rp 170.000 | ☐ |
| BEZVOLT Power Wall 5120Wh | Rp 15.700.000 | ☐ |
| BEZVOLT Hybrid Inverter 6000W | Rp 15.900.000 | ☐ |
| BLUETTI AC50P | Rp 6.590.000 | ☐ |

**Action**: Compare against current price list or energi.click product pages.

---

### 2. Product Stock — ⚠️ VERIFY

Stock values were estimated during initial data entry.

| Product | Stock in Code | Needs Verification |
|---------|-------------|-------------------|
| Mitsubishi 275Wp | 3 pcs | ☐ |
| Canadian Solar 440Wp | 5 pcs | ☐ |
| Baterai Lithium 12.8V 60Ah | 2 pcs | ☐ |
| LONGi Hi-MO 5 540Wp | 10 pcs | ☐ |
| Panel Bekas 50/100Wp | 20 pcs | ☐ |
| BEZVOLT Power Wall | 4 pcs | ☐ |
| BEZVOLT Hybrid Inverter | 3 pcs | ☐ |
| BLUETTI AC50P | 6 pcs | ☐ |

**Impact**: Overselling or underselling. Displayed on product detail as "Stok tersedia (N pcs)".

---

### 3. Product Images — ❌ ALL PLACEHOLDER

**Every product uses the same gray placeholder image:**

```
/images/placeholder/product-placeholder.webp
```

None of the 8 products have real images. The original energi.click product images were not downloaded.

**Action**: Source real product images and update `images` array in `src/lib/data/products.ts`.

---

### 4. SKU Numbers — ⚠️ VERIFY

SKU values were fabricated during initial data entry based on brand name conventions.

| Product | SKU in Code | Source |
|---------|-----------|--------|
| Mitsubishi 275Wp | `MITSUBISHI-MJE275FB` | Fabricated |
| Canadian Solar 440Wp | `CS-CS3W-440MS` | Fabricated |
| Baterai Lithium | `BAT-PJU-12860` | Fabricated |
| LONGi 540Wp | `LONGI-LR5-72HBD-540M` | Fabricated |
| Panel Bekas | `PANEL-BEKAS-50-100` | Fabricated |
| BEZVOLT Power Wall | `BEZ-PW-5120` | Fabricated |
| BEZVOLT Inverter | `BEZ-HYBRID-6000` | Fabricated |
| BLUETTI AC50P | `BLU-AC50P` | Fabricated |

**Impact**: If SKU is used for inventory management or order fulfillment, every SKU is wrong.

**Action**: Verify against actual warehouse/ERP system. Update or remove if SKU is not used operationally.

---

### 5. WhatsApp Number — ❌ DEFAULT PLACEHOLDER

```typescript
// src/lib/constants.ts
whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '6281234567890',
```

`6281234567890` is a default fallback, not a real number. It is used in:
- Floating WhatsApp button (all pages)
- RFQ confirmation WhatsApp link
- Affiliate page CTA
- Product detail "Konsultasi via WhatsApp"
- FAQ contact CTA

**Action**: Set `NEXT_PUBLIC_WHATSAPP_NUMBER` environment variable in production, OR replace the hardcoded fallback with the real number.

---

### 6. Company Address — ⚠️ VERIFY

```typescript
address: 'Rekasurya EcoBuilding, Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, 
          Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
```

This was copied from energi.click's footer. Displayed on:
- Footer (all pages)
- About Us static page

**Action**: Confirm this is the current/correct business address. Verify for shipping returns.

---

### 7. Company Name — ⚠️ VERIFY

```
Company: "Rekasurya"
Brand: "Energi.Click"
Tagline: "Energi Cerdas, Tinggal Klik!"
```

Used everywhere — metadata, JSON-LD Organization schema, footer, About Us page.

**Action**: Confirm "Rekasurya" is the correct legal entity name behind Energi.Click.

---

### 8. Shipping Policy — ⚠️ VERIFY

Embedded in `src/lib/data/static-pages.ts` under slug `kebijakan-pengiriman`.

Claims:
- Jawa & Bali: 2–5 hari kerja
- Sumatera, Kalimantan, Sulawesi: 5–10 hari kerja
- Indonesia Timur: 7–14 hari kerja

**Action**: Verify shipping timelines and carriers with operations team.

---

### 9. Return Policy — ⚠️ VERIFY

Embedded in `src/lib/data/static-pages.ts` under slug `kebijakan-retur`.

Claims:
- Retur dalam 7 hari
- Produk clearance tidak dapat diretur
- Biaya pengiriman retur ditanggung pembeli

**Action**: Legal review required. These terms create binding obligations.

---

### 10. Privacy Policy — ⚠️ VERIFY

Embedded in `src/lib/data/static-pages.ts` under slug `kebijakan-privasi`.

Claims data is encrypted, not shared with third parties, and users can request deletion.

**Action**: Legal review required. Must comply with Indonesian PDP Law (UU Perlindungan Data Pribadi).

---

### 11. Affiliate Commission Rates — ⚠️ VERIFY

```typescript
// All 8 products have:
affiliateCommission: { percent: 2.5, amount: X }
```

Every product uses 2.5%. The affiliate info page claims "Komisi 2.5%–5%".

**Action**: Confirm actual commission rates per product category. The code says 2.5% for everything — the marketing page says up to 5%.

---

### 12. Contact Information — ⚠️ VERIFY

```typescript
email: 'info@energi.click',
phone: '(022) 20522279',
```

**Action**: Verify these are active and monitored. Test: send email, call number.

---

## Summary

| # | Item | Status | Action Owner |
|---|------|--------|-------------|
| 1 | Product prices | ⚠️ Verify | Business |
| 2 | Product stock | ⚠️ Verify | Warehouse |
| 3 | Product images | ❌ All placeholder | Design/Content |
| 4 | SKU numbers | ❌ All fabricated | Warehouse |
| 5 | WhatsApp number | ❌ Default fallback | Business |
| 6 | Company address | ⚠️ Verify | Business |
| 7 | Company name | ⚠️ Verify | Legal |
| 8 | Shipping policy | ⚠️ Verify | Operations |
| 9 | Return policy | ⚠️ Legal review | Legal |
| 10 | Privacy policy | ⚠️ Legal review | Legal |
| 11 | Affiliate rates | ⚠️ Verify | Business |
| 12 | Contact info | ⚠️ Verify | Business |

**Technically**: The application is production-ready. Build passes. Tests pass. SEO infrastructure complete.

**Operationally**: 12 items require human verification before launch. Zero can be verified by code review alone.

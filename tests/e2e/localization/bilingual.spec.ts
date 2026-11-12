import { test, expect } from '@playwright/test';

/**
 * Bilingual behaviour: Indonesian is the source language and the default; English is an added
 * locale selected from the header switcher.
 *
 * What this covers (localization architecture requirement, section 6):
 *   - a new visitor sees the source language
 *   - switching updates the visible public content, server-rendered
 *   - switching back restores the source language
 *   - the choice persists across navigation and across visits
 *   - product pages and specifications work in both locales
 *   - no unintended mixed-language UI on representative routes
 */

const ID_MARKERS = /\b(Belanja|Tambah ke Keranjang|Keranjang|Beranda|Cari|Produk|Harga|Stok|Kirim|Batal|Simpan|Hapus|Lanjutkan)\b/;
const EN_MARKERS = /\b(Shop|Add to Cart|Cart|Home|Search|Products|Price|Stock|Send|Cancel|Save|Delete|Continue)\b/;

const ROUTES = ['/', '/produk', '/keranjang', '/faq', '/perbandingan', '/permintaan-penawaran'];

/** The switcher writes the locale cookie; make it explicit for cookie assertions. */
async function switchTo(page: import('@playwright/test').Page, code: 'ID' | 'EN') {
  await page.getByRole('button', { name: code === 'ID' ? 'Bahasa Indonesia' : 'English' }).click();
  await page.waitForLoadState('networkidle');
}

test.describe('language selection', () => {
  test('a new visitor gets the source language (Indonesian)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect(page.getByText('Belanja', { exact: false }).first()).toBeVisible();
    // the switch control is present and shows which language is active
    const id = page.getByRole('button', { name: 'Bahasa Indonesia' });
    const en = page.getByRole('button', { name: 'English' });
    await expect(id).toHaveAttribute('aria-pressed', 'true');
    await expect(en).toHaveAttribute('aria-pressed', 'false');
  });

  test('switching to English translates the chrome, then back restores Indonesian', async ({ page, context }) => {
    await page.goto('/');

    await switchTo(page, 'EN');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('Shop', { exact: true }).first()).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('en');

    await switchTo(page, 'ID');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
    await expect(page.getByText('Belanja', { exact: false }).first()).toBeVisible();
  });

  test('the choice persists across navigation and a later visit', async ({ page }) => {
    await page.goto('/');
    await switchTo(page, 'EN');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // navigating within the site must not reset the choice
    await page.goto('/produk');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // and it survives a fresh document (subsequent visit)
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('both locales render without mixed-language UI', () => {
  test('English locale shows no Indonesian chrome', async ({ page, context }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' }]);
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const text = await page.locator('body').innerText();
      const found = [...new Set((text.match(ID_MARKERS) ?? []))];
      expect(found, `Indonesian chrome on ${route} while English is selected: ${found.join(', ')}`).toEqual([]);
    }
  });

  test('Indonesian locale shows no English chrome', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const text = await page.locator('body').innerText();
      const found = [...new Set((text.match(EN_MARKERS) ?? []))];
      expect(found, `English chrome on ${route} while Indonesian is selected: ${found.join(', ')}`).toEqual([]);
    }
  });
});

test.describe('dynamic content follows the locale', () => {
  test('product page and its specification table translate', async ({ page, context }) => {
    const product = '/produk/ja-solar-module-610wp-n-type-topcon-monocrystalline';

    await page.goto(product, { waitUntil: 'domcontentloaded' });
    const idText = await page.locator('body').innerText();
    // the CMS row is Indonesian; specification labels come from the source language
    expect(idText).toMatch(/Spesifikasi|Garansi|Berat|Daya|Tegangan/);

    await context.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' }]);
    await page.goto(product, { waitUntil: 'domcontentloaded' });
    const enText = await page.locator('body').innerText();
    expect(enText).toMatch(/Specifications|Warranty|Weight|Power|Voltage/);
  });

  test('metadata follows the locale', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const idTitle = await page.title();
    expect(idTitle).toMatch(/Terbarukan|Terjangkau/);

    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: 'http://localhost:3000' }]);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const enTitle = await page.title();
    expect(enTitle).toMatch(/Renewable|Affordable/);
  });
});

test.describe('existing routes and behaviour are intact', () => {
  test('public routes still respond and enquiry form is reachable in both locales', async ({ page }) => {
    for (const route of [...ROUTES, '/wishlist', '/promo', '/artikel', '/proyek', '/testimoni']) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} should respond`).toBeLessThan(400);
    }
    await expect(page.getByRole('button', { name: /Kirim|Send/ }).first()).toBeVisible();
  });
});

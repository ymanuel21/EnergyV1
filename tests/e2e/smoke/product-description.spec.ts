import { test, expect } from '@playwright/test';

test.describe('Product description renderer', () => {
  test('renders Huawei description as bullets + paragraphs (no literal dashes)', async ({ page }) => {
    await page.goto('/produk/huawei-sun-2000-5ktl-l1-5-kw-on-grid-inverter');

    const desc = page.locator('div.prose');
    await expect(desc).toBeVisible();

    // Bullet list is present
    const listItems = desc.locator('ul li');
    await expect(listItems.first()).toBeVisible();
    await expect(listItems.first()).toContainText('Efisiensi & Input (PV)');

    // No literal "- " prefix remains inside list items
    await expect(desc.locator('ul li').first()).not.toContainText(/^- /);

    // Section heading is rendered as a paragraph (not swallowed into the list)
    await expect(desc.locator('p').first()).toContainText('SPESIFIKASI TEKNIS');

    // A mid-line hyphenated value is preserved verbatim (not split into a bullet)
    await expect(desc.getByText(/MPPT Operating Voltage Range/)).toBeVisible();
    await expect(desc.getByText(/90 V/)).toBeVisible();
  });
});

test.describe('Product card wishlist', () => {
  test('heart toggles wishlist state and shows a toast', async ({ page }) => {
    await page.goto('/produk');

    const heart = page.locator('button[aria-label*="wishlist"]').first();
    await expect(heart).toBeVisible();
    await expect(heart).toHaveAttribute('aria-pressed', 'false');

    await heart.click();
    await expect(heart).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Ditambahkan ke wishlist')).toBeVisible();

    await heart.click();
    await expect(heart).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('Dihapus dari wishlist')).toBeVisible();
  });
});

test.describe('Product card image consistency', () => {
  test('all card image boxes have identical dimensions', async ({ page }) => {
    await page.goto('/produk');

    // The image container is the aspect-square Link wrapping each SafeImage
    const boxes = page.locator('a.aspect-square.overflow-hidden');
    const count = await boxes.count();
    expect(count).toBeGreaterThan(0);

    const sizes = await boxes.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      })
    );

    // Every box must be the same width and height (square, consistent)
    const first = sizes[0];
    for (const s of sizes) {
      expect(s.w, `box ${s.w}x${s.h} vs ${first.w}x${first.h}`).toBe(first.w);
      expect(s.h, `box ${s.h} vs ${first.h}`).toBe(first.h);
    }
  });
});

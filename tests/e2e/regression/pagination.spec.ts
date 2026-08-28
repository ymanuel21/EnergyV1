import { test, expect } from '@playwright/test';

/**
 * Regression test for the pagination "duplicate page number" bug.
 *
 * Bug: for current=3 (siblingCount=1), leftSibling=2 was emitted both by the
 * left-range and by the middle loop, producing "1 2 2 3 4 … 21".
 *
 * This asserts the rendered page-number links contain no duplicates.
 */
test.describe('Pagination', () => {
  test('has no duplicate page numbers on page 3', async ({ page }) => {
    await page.goto('/produk?sort=price-asc&page=3');

    const nav = page.locator('nav[aria-label="Pagination"]');
    await expect(nav).toBeVisible();

    // Page-number links are numeric-only links; prev/next carry text and the
    // ellipsis is a non-link <span>, so they are excluded by this filter.
    const pageLinks = nav.locator('a').filter({ hasText: /^\d+$/ });
    const labels = (await pageLinks.allTextContents()).map((t) => t.trim());

    // No duplicate page numbers.
    expect(new Set(labels).size).toBe(labels.length);

    // The current page (3) is present.
    expect(labels).toContain('3');
  });

  test('renders expected sequence 1,2,3,4 … last on page 3', async ({ page }) => {
    await page.goto('/produk?sort=price-asc&page=3');

    const nav = page.locator('nav[aria-label="Pagination"]');
    const pageLinks = nav.locator('a').filter({ hasText: /^\d+$/ });
    const labels = (await pageLinks.allTextContents()).map((t) => t.trim());

    // The first four page numbers must be 1, 2, 3, 4 (no duplicated "2").
    expect(labels.slice(0, 4)).toEqual(['1', '2', '3', '4']);
  });
});

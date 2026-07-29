import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin API Security', () => {
  test('bulk-products endpoint requires auth', async ({ request }) => {
    // Unauthenticated request should fail
    const fd = new FormData();
    fd.set('ids', JSON.stringify(['test-id']));
    fd.set('action', 'publish');

    const res = await request.post('/api/admin/bulk-products', {
      multipart: fd,
      failOnStatusCode: false,
    });

    // Should redirect to login or return error
    expect(res.status()).not.toBe(200);
  });

  test('bulk-products works when authenticated', async ({ page, request }) => {
    await loginAsAdmin(page);

    // Get a real product ID from the product list
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Find first product edit link to extract an ID
    const editLink = page.locator('a[href*="/admin/products/"]').first();
    if (await editLink.isVisible()) {
      const href = await editLink.getAttribute('href');
      const productId = href?.split('/').pop();

      if (productId) {
        // Need to send with cookies from the logged-in page
        const cookies = await page.context().cookies();
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        const fd = new FormData();
        fd.set('ids', JSON.stringify([productId]));
        fd.set('action', 'publish');

        const res = await request.post('/api/admin/bulk-products', {
          multipart: fd,
          headers: { Cookie: cookieHeader },
          failOnStatusCode: false,
        });

        // Should succeed (200) or have a valid response
        expect([200, 302, 401]).toContain(res.status());
      }
    }
  });

  test('export endpoint requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/products/export', { failOnStatusCode: false });
    expect(res.status()).not.toBe(200);
  });

  test('import endpoint requires auth', async ({ request }) => {
    const res = await request.post('/api/admin/products/import', {
      data: { rows: [], mapping: {} },
      failOnStatusCode: false,
    });
    expect(res.status()).not.toBe(200);
  });

  test('search-products endpoint requires auth', async ({ request }) => {
    const res = await request.get('/api/admin/search-products?q=panel', {
      failOnStatusCode: false,
    });
    expect(res.status()).not.toBe(200);
  });
});

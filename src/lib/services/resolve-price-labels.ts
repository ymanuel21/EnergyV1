// Helper: resolve price labels for a list of products
// Returns Map<productId, priceLabel | undefined>
// Only sets label when mode !== SHOW_PRICE

import { resolvePriceDisplay } from '@/lib/services/product-pricing';

export async function resolvePriceLabels(products: any[]): Promise<Map<string, string | undefined>> {
  const labels = new Map<string, string | undefined>();
  await Promise.all(products.map(async (p: any) => {
    const pd = await resolvePriceDisplay(p);
    if (pd.mode !== 'SHOW_PRICE') labels.set(p.id, pd.label);
  }));
  return labels;
}

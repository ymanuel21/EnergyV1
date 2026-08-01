import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { Button } from '@ui/Button';
import { Tabs } from '@ui/Tabs';
import { ImageGallery } from '@components/product/ImageGallery';
import { PriceBlock } from '@components/product/PriceBlock';
import { ProductBadgeGroup } from '@components/product/ProductBadge';
import { AddToCartButton } from '@components/product/AddToCartButton';
import { ClipboardCopyButton } from '@components/product/ShareButton';
import { WishlistToggleButton } from '@components/product/WishlistToggleButton';
import { CompareToggleButton } from '@components/product/CompareToggleButton';
import { ProductCarouselSection } from '@components/home/ProductCarouselSection';
import { BrandLogo } from '@ui/BrandLogo';
import { getProductBySlug, getAllProducts } from '@/lib/api/products';
import { resolvePriceDisplay } from '@/lib/services/product-pricing';
import { getAllCategories } from '@/lib/api/categories';
import { getBrandById } from '@/lib/api/brands';
import { SITE } from '@lib/constants';
import { notFound } from 'next/navigation';
import { ProductViewTracker } from '@components/product/ProductTracker';
import { SmartBackButton } from '@/components/ui/SmartBackButton';

export const revalidate = 3600; // ISR: revalidate every hour

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const allProducts = await getAllProducts();
  return allProducts.map((p: any) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Produk Tidak Ditemukan' };

  const brand = await getBrandById(product.brandId);
  const priceDisplay = await resolvePriceDisplay(product as any);

  return {
    title: product.name,
    description: priceDisplay.mode === 'SHOW_PRICE'
      ? `${brand?.name ?? ''} ${product.name} — Rp ${product.price.toLocaleString('id-ID')}. Beli sekarang di ${SITE.name}.`
      : `${brand?.name ?? ''} ${product.name} — ${priceDisplay.label}. ${SITE.name}.`,
    alternates: { canonical: `/produk/${slug}` },
    openGraph: {
      title: product.name,
      description: (product.description || '').substring(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [brand, allCategories, allProducts] = await Promise.all([
    getBrandById(product.brandId),
    getAllCategories(),
    getAllProducts(),
  ]);

  const category = allCategories.find((c: any) => c.id === product.categoryId);
  const subcategory = product.subcategoryId
    ? allCategories.flatMap((c: any) => c.children ?? []).find((c: any) => c.id === product.subcategoryId)
    : undefined;
  const priceDisplay = await resolvePriceDisplay(product as any);

  // Related products from the new ProductRelation system
  const relationIds = (product as any).relations?.map((r: any) => r.relatedProductId) || [];
  const relatedProducts = relationIds.length > 0
    ? allProducts.filter((p: any) => relationIds.includes(p.id)).slice(0, 10)
    : allProducts.filter((p: any) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, 5);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images?.[0],
            description: product.description,
            sku: product.sku,
            mpn: product.model,
            brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'IDR',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />

      <Container className="py-6">
        <SmartBackButton fallbackRoute="/produk" label="← Kembali ke Produk" className="mb-3" />
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Beranda', href: '/' },
            ...(category ? [{ label: category.name, href: `/kategori/${category.slug}` }] : []),
            ...(subcategory
              ? [{ label: subcategory.name, href: `/kategori/${subcategory.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        {/* Product layout */}
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <ImageGallery images={product.images || []} productName={product.name} />

          <div className="space-y-4">
            <ProductBadgeGroup badges={product.badges || []} />

            {brand && (
              <Link
                href={`/brand/${brand.slug}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <BrandLogo name={brand.name} logo={brand.logo} size="sm" />
                {brand.name}
              </Link>
            )}

            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{product.name}</h1>

            <p className="text-sm text-gray-500">
              SKU: {product.sku}
              {product.model && ` • Model: ${product.model}`}
            </p>

            {/* Share */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Bagikan:</span>
              <ClipboardCopyButton />
            </div>

            <PriceBlock
              price={product.price}
              originalPrice={product.originalPrice}
              stock={product.stock}
              overrideLabel={priceDisplay.mode !== 'SHOW_PRICE' ? priceDisplay.label : undefined}
            />

            {priceDisplay.cta && (
              <a href={priceDisplay.ctaHref || '/permintaan-penawaran'} className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">
                {priceDisplay.cta}
              </a>
            )}

            {priceDisplay.showPrice && (
            <AddToCartButton
              productId={product.id}
              slug={product.slug}
              name={product.name}
              brandName={brand?.name ?? ''}
              image={product.images?.[0] || '/images/placeholder/product-placeholder.png'}
              price={product.price}
              maxQuantity={product.stock}
              weight={product.weight}
            />
            )}

            <Link
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
                `Halo Admin EBTPlaza 👋\n\nSaya tertarik dengan produk berikut:\n\n📦 Produk: ${product.name}\n🏷️ Brand: ${brand?.name ?? '-'}\n💰 ${priceDisplay.mode === 'SHOW_PRICE' ? `Harga: Rp ${product.price.toLocaleString('id-ID')}` : `Status: ${priceDisplay.label}`}\n🔗 Link Produk: ${SITE.url}/produk/${slug}\n\nApakah produk ini masih tersedia?\n\nMohon informasi mengenai:\n• Stok terbaru\n• Estimasi pengiriman\n• Garansi\n• Ongkos kirim ke lokasi saya\n\nTerima kasih.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg border border-green-500 py-2.5 text-center text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              Konsultasi via WhatsApp
            </Link>

            <div className="flex gap-3">
              <WishlistToggleButton productId={product.id} />
              <CompareToggleButton productSlug={product.slug} />
            </div>

            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Kondisi: {product.condition === 'new' ? 'Baru' : product.condition === 'used' ? 'Bekas' : 'Baru - Sisa Proyek'} • Garansi: {product.warranty}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <Tabs
            tabs={[
              {
                id: 'description',
                label: 'Deskripsi',
                content: (
                  <div className="prose max-w-none text-sm text-gray-700">
                    <p>{product.description}</p>
                    <h3>Keunggulan</h3>
                    <ul>
                      {(product.specifications || []).map((spec: any) => (
                        <li key={spec.key || spec.label}>
                          <strong>{spec.key || spec.label}:</strong> {spec.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                id: 'specs',
                label: 'Spesifikasi',
                content: (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {(product.specifications || []).map((spec: any) => (
                          <tr key={spec.key || spec.label} className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium text-gray-700">{spec.key || spec.label}</td>
                            <td className="py-2 text-gray-600">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              ...(product.documents?.length
                ? [
                    {
                      id: 'documents',
                      label: `Dokumen (${product.documents.length})`,
                      content: (
                        <ul className="space-y-2">
                          {product.documents.map((doc: any) => (
                            <li key={doc.name}>
                              <a
                                href={doc.url}
                                className="text-gray-900 hover:underline text-sm"
                                target="_blank"
                                rel="noopener"
                              >
                                📄 {doc.name} {doc.size && `(${doc.size})`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]
                : []),
              {
                id: 'shipping',
                label: 'Pengiriman & Garansi',
                content: (
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Garansi: {product.warranty}</p>
                    <p>Pengiriman ke seluruh Indonesia. Biaya pengiriman dihitung saat checkout.</p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Container>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductCarouselSection
          title="Produk Terkait"
          products={relatedProducts}
        />
      )}
    </>
  );
}

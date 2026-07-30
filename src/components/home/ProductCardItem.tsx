import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';

interface ProductCardItemProps {
  product: any;
  showPrice: boolean;
  showBadge: boolean;
  priceLabels: Map<string, string | undefined>;
  featuredCount: number;
}

export function ProductCardItem({ product: p, showPrice, showBadge, priceLabels, featuredCount }: ProductCardItemProps) {
  const isSingle = featuredCount === 1;
  return (
    <Link href={`/produk/${p.slug}`}
      className={`group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition block ${isSingle ? 'flex flex-col sm:flex-row' : ''}`}>
      <div className={`overflow-hidden bg-surface ${isSingle ? 'sm:w-[55%] aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'}`}>
        <SafeImage src={p.images?.[0] || ''} alt={p.name} width={400} height={400}
          className="h-full w-full object-contain p-4 group-hover:scale-105 transition duration-500" />
      </div>
      <div className={`p-4 ${isSingle ? 'sm:w-[45%] flex flex-col justify-center' : ''}`}>
        <h3 className={`font-medium text-primary line-clamp-2 ${isSingle ? 'text-lg' : 'text-sm'}`}>{p.name}</h3>
        {showPrice && (
          <div className="mt-2 flex items-baseline gap-2">
            {priceLabels.get(p.id) ? (
              <span className="text-sm text-muted">{priceLabels.get(p.id)}</span>
            ) : (
              <>
                <span className={`font-semibold ${isSingle ? 'text-xl' : 'text-base'}`}>Rp {p.price?.toLocaleString('id-ID')}</span>
                {p.originalPrice > p.price && (
                  <span className="text-xs text-muted line-through">Rp {p.originalPrice?.toLocaleString('id-ID')}</span>
                )}
              </>
            )}
          </div>
        )}
        {showBadge && p.badgeRelations?.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {p.badgeRelations.slice(0, 2).map((br: any) => (
              <span key={br.badge?.slug || br.badge?.name}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: (br.badge as any)?.bgColor || '#f0f0f0', color: (br.badge as any)?.color || '#333' }}>
                {(br.badge as any)?.name as string}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

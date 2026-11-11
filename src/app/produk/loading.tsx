import { Container } from '@ui/Container';
import { Skeleton } from '@ui/Skeleton';

/**
 * Loading fallback for /produk.
 *
 * Mirrors src/app/produk/page.tsx — same Container, heading block, 2/3/4-column
 * grid and pagination strip — so navigating between pages keeps the layout stable
 * instead of blanking the screen. Pure markup: no queries, no data fetching.
 */
export default function AllProductsLoading() {
  return (
    <Container className="py-6">
      <div aria-hidden="true">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 motion-reduce:animate-none" />
          <Skeleton className="h-4 w-2 motion-reduce:animate-none" />
          <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
        </div>

        {/* Heading + sort control */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 motion-reduce:animate-none" />
            <Skeleton className="mt-2 h-4 w-32 motion-reduce:animate-none" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg motion-reduce:animate-none" />
        </div>

        {/* 12 cards, matching the real grid: grid-cols-2 / sm:3 / lg:4 */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white">
              <Skeleton className="aspect-square rounded-none motion-reduce:animate-none" />
              <div className="flex flex-col gap-1 p-4">
                <Skeleton className="h-3 w-16 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-full motion-reduce:animate-none" />
                <Skeleton className="h-5 w-24 motion-reduce:animate-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination strip */}
        <div className="mt-8 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-10 rounded-lg motion-reduce:animate-none" />
          ))}
        </div>
      </div>
    </Container>
  );
}

import { Container } from '@ui/Container';
import { Skeleton } from '@ui/Skeleton';

export default function CategoryLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="mb-2 h-4 w-48" />
      <Skeleton className="mt-4 h-8 w-64" />
      <Skeleton className="mt-1 h-4 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </Container>
  );
}

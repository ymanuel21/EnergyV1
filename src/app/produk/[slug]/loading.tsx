import { Container } from '@ui/Container';
import { Skeleton } from '@ui/Skeleton';

export default function ProductLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="mb-2 h-4 w-64" />
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Container>
  );
}

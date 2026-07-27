'use client';

import { useIsPrototype } from '@/lib/prototype-detection';

export function ProductionOnly({ children }: { children: React.ReactNode }) {
  const isPrototype = useIsPrototype();
  if (isPrototype) return null;
  return <>{children}</>;
}

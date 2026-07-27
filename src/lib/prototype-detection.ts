'use client';

import { usePathname } from 'next/navigation';

export function isPrototypePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/prototype') || pathname.startsWith('/(prototype)');
}

export function useIsPrototype(): boolean {
  const pathname = usePathname();
  return isPrototypePath(pathname);
}

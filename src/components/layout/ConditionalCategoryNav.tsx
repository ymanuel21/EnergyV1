'use client';

import { usePathname } from 'next/navigation';
import { CategoryNav } from './CategoryNav';

export function ConditionalCategoryNav() {
  const pathname = usePathname();

  // Hide CategoryNav on prototype pages
  if (pathname?.startsWith('/prototype')) return null;

  return <CategoryNav />;
}

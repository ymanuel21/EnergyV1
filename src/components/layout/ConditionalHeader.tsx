'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();

  if (pathname === '/') {
    // Lazy-load HomepageNav only on homepage to avoid bundling it everywhere
    const { HomepageNav } = require('./HomepageNav');
    return <HomepageNav />;
  }

  return <Header />;
}

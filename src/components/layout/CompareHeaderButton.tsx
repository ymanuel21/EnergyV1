'use client';

import Link from 'next/link';
import { useCompare } from '@providers/CompareProvider';
import { IconButton } from '@ui/IconButton';
import { CompareIcon } from '@ui/Icons';

export function CompareHeaderButton() {
  const { items } = useCompare();
  return (
    <Link href="/perbandingan">
      <IconButton label="Perbandingan" badge={items.length > 0 ? items.length : undefined}>
        <CompareIcon />
      </IconButton>
    </Link>
  );
}

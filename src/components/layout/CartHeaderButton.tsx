'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@providers/CartProvider';
import { IconButton } from '@ui/IconButton';
import { CartIcon } from '@ui/Icons';
import Link from 'next/link';

export function CartHeaderButton() {
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Only show badge after client hydration to avoid SSR mismatch
  const badge = mounted ? itemCount : 0;

  return (
    <Link href="/keranjang">
      <IconButton label="Keranjang" badge={badge}>
        <CartIcon />
      </IconButton>
    </Link>
  );
}

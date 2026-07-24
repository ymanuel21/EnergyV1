'use client';

import { useCart } from '@providers/CartProvider';
import { IconButton } from '@ui/IconButton';
import { CartIcon } from '@ui/Icons';
import Link from 'next/link';

export function CartHeaderButton() {
  const { itemCount } = useCart();

  return (
    <Link href="/keranjang">
      <IconButton label="Keranjang" badge={itemCount}>
        <CartIcon />
      </IconButton>
    </Link>
  );
}

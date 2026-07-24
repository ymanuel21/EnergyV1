'use client';

import { Button } from '@ui/Button';
import { useWishlist } from '@providers/WishlistProvider';

interface WishlistToggleButtonProps {
  productId: string;
  size?: 'sm' | 'md';
}

export function WishlistToggleButton({ productId, size = 'sm' }: WishlistToggleButtonProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const active = isInWishlist(productId);

  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => toggleItem(productId)}
      data-testid="wishlist-toggle"
    >
      {active ? '♥ Wishlist' : '♡ Wishlist'}
    </Button>
  );
}

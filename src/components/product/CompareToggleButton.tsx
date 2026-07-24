'use client';

import { Button } from '@ui/Button';
import { useCompare } from '@providers/CompareProvider';

interface CompareToggleButtonProps {
  productId: string;
  size?: 'sm' | 'md';
}

export function CompareToggleButton({ productId, size = 'sm' }: CompareToggleButtonProps) {
  const { isComparing, toggleItem } = useCompare();
  const active = isComparing(productId);

  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => toggleItem(productId)}
      data-testid="compare-toggle"
    >
      {active ? '⇄ Dibandingkan' : '⇄ Bandingkan'}
    </Button>
  );
}

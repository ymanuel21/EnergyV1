'use client';

import { Button } from '@ui/Button';
import { useCompare } from '@providers/CompareProvider';

interface CompareToggleButtonProps {
  productSlug: string;
  size?: 'sm' | 'md';
}

export function CompareToggleButton({ productSlug, size = 'sm' }: CompareToggleButtonProps) {
  const { isComparing, toggleItem } = useCompare();
  const active = isComparing(productSlug);

  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => toggleItem(productSlug)}
      data-testid="compare-toggle"
    >
      {active ? '⇄ Dibandingkan' : '⇄ Bandingkan'}
    </Button>
  );
}

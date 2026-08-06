'use client';

import { Button } from '@ui/Button';
import { useCompare } from '@providers/CompareProvider';

interface CompareToggleButtonProps {
  productSlug: string;
  size?: 'sm' | 'md';
}

const sizeCls = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

export function CompareToggleButton({ productSlug, size = 'sm' }: CompareToggleButtonProps) {
  const { isComparing, toggleItem } = useCompare();
  const active = isComparing(productSlug);

  const baseCls =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] ' +
    'border border-primary text-primary hover:bg-surface ' +
    sizeCls[size];

  return (
    <button
      type="button"
      className={baseCls}
      onClick={() => toggleItem(productSlug)}
      data-testid="compare-toggle"
    >
      {active ? '⇄ Dibandingkan' : '⇄ Bandingkan'}
    </button>
  );
}

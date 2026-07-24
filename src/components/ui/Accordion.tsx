'use client';

import { useState } from 'react';
import { cn } from '@lib/utils/cn';

export interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({
  title,
  defaultOpen = false,
  children,
  className,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-900 hover:text-brand-700 transition-colors"
      >
        {title}
        <svg
          className={cn(
            'h-5 w-5 shrink-0 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-500 animate-slide-down">
          {children}
        </div>
      )}
    </div>
  );
}

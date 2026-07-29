'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

const ENTITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Products' },
  { value: 'project', label: 'Projects' },
];

export function ReviewFilters({
  currentStatus,
  currentEntity,
}: {
  currentStatus: string;
  currentEntity: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const navigate = useCallback(
    (status?: string, entity?: string) => {
      const params = new URLSearchParams();
      const s = status ?? currentStatus;
      const e = entity ?? currentEntity;
      if (s && s !== 'pending') params.set('status', s);
      if (e && e !== 'all') params.set('entity', e);
      const qs = params.toString();
      router.push(`/admin/reviews${qs ? `?${qs}` : ''}`);
    },
    [currentStatus, currentEntity, router]
  );

  return (
    <div className="space-y-3">
      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-border pb-3 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => navigate(tab.value, undefined)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
              currentStatus === tab.value
                ? 'bg-primary text-white'
                : 'text-muted hover:text-primary hover:bg-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entity Filter + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {ENTITY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => navigate(undefined, f.value)}
              className={`px-3 py-1 text-xs font-medium rounded border transition ${
                currentEntity === f.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted hover:border-primary/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full rounded-lg border border-border pl-8 pr-3 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">🔍</span>
        </div>
      </div>
    </div>
  );
}

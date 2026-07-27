'use client';

import { useState, useEffect } from 'react';

interface BadgeSelectorProps {
  defaultBadgeIds?: string[];
}

export function BadgeSelector({ defaultBadgeIds = [] }: BadgeSelectorProps) {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/badges')
      .then(r => r.json())
      .then(data => setBadges(data))
      .catch(() => {});
  }, []);

  if (badges.length === 0) {
    return <p className="text-sm text-gray-400">Tidak ada badge tersedia</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto rounded-lg border border-gray-300 p-3 bg-white">
      {badges.map((b: any) => (
        <label
          key={b.id}
          className="flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border transition hover:opacity-80"
          style={{
            color: b.color,
            backgroundColor: b.bgColor,
            borderColor: b.color + '30',
          }}
        >
          <input
            type="checkbox"
            name={`badge-${b.id}`}
            value={b.id}
            defaultChecked={defaultBadgeIds.includes(b.slug) || defaultBadgeIds.includes(b.name)}
            className="sr-only peer"
          />
          {b.icon && <span>{b.icon}</span>}
          {b.name}
        </label>
      ))}
    </div>
  );
}

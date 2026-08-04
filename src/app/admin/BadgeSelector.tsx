'use client';

import { useState, useEffect } from 'react';

interface BadgeSelectorProps {
  /** Currently selected badge IDs (controlled) */
  value: string[];
  /** Called when selection changes */
  onChange: (badgeIds: string[]) => void;
}

export function BadgeSelector({ value, onChange }: BadgeSelectorProps) {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/badges')
      .then(r => r.json())
      .then(data => setBadges(data))
      .catch(() => {});
  }, []);

  if (badges.length === 0) {
    return <p className="text-sm text-muted">Tidak ada badge tersedia</p>;
  }

  function toggle(badgeId: string) {
    if (value.includes(badgeId)) {
      onChange(value.filter(id => id !== badgeId));
    } else {
      onChange([...value, badgeId]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto rounded-lg border border-border p-3 bg-card">
      {badges.map((b: any) => {
        const selected = value.includes(b.id);
        return (
          <label
            key={b.id}
            className={`flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border transition hover:opacity-80 ${selected ? 'ring-2 ring-offset-1' : ''}`}
            style={{
              color: b.color,
              backgroundColor: selected ? b.color + '20' : b.bgColor,
              borderColor: b.color + '30',
              ...(selected ? { ringColor: b.color } : {}),
            }}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggle(b.id)}
              className="sr-only"
            />
            {b.icon && <span>{b.icon}</span>}
            {b.name}
          </label>
        );
      })}
    </div>
  );
}

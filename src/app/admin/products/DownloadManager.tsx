'use client';

import { useState } from 'react';

interface Download { name: string; type: string; url: string; }

interface DownloadManagerProps {
  value: Download[];
  onChange: (value: Download[]) => void;
}

const TYPES = [
  { key: 'datasheet', label: 'Datasheet', icon: '📄' },
  { key: 'manual', label: 'Manual', icon: '📘' },
  { key: 'warranty', label: 'Warranty', icon: '🛡️' },
  { key: 'certificate', label: 'Certificate', icon: '✅' },
  { key: 'other', label: 'Other', icon: '📎' },
];

export function DownloadManager({ value, onChange }: DownloadManagerProps) {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('datasheet');

  const add = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    onChange([...value, { name: newName.trim(), url: newUrl.trim(), type: newType }]);
    setNewName(''); setNewUrl('');
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {/* Existing downloads */}
      {value.map((d, i) => {
        const t = TYPES.find(t => t.key === d.type);
        return (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 group hover:bg-surface/30 transition">
            <span className="text-lg">{t?.icon || '📎'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{d.name}</p>
              <p className="text-[10px] text-muted">{t?.label || d.type} · {d.url}</p>
            </div>
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs">Remove</button>
          </div>
        );
      })}

      {value.length === 0 && <p className="text-xs text-muted py-2">No downloads yet. Add a datasheet, manual, or certificate below.</p>}

      {/* Add form */}
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-xs font-medium text-primary">+ Add Document</p>
        <div className="flex gap-2">
          <select value={newType} onChange={e => setNewType(e.target.value)}
            className="rounded border border-border px-2 py-1.5 text-xs bg-card focus:border-primary outline-none w-28">
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Document name"
            className="flex-1 rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
        </div>
        <div className="flex gap-2">
          <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL or file path"
            className="flex-1 rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
          <button type="button" onClick={add}
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition">Add</button>
        </div>
      </div>
    </div>
  );
}

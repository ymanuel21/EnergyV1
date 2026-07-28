'use client';

import { useState } from 'react';

export function SectionEditor({ section, index, onSave, onDelete }: { section: any; index: number; onSave: (data: FormData) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(section.title || '');
  const [subtitle, setSubtitle] = useState(section.subtitle || '');

  const handleToggle = async () => {
    const fd = new FormData();
    fd.set('id', section.id);
    fd.set('type', section.type);
    fd.set('title', title);
    fd.set('subtitle', subtitle);
    fd.set('settings', JSON.stringify(section.settings || {}));
    fd.set('enabled', String(!section.enabled));
    fd.set('sortOrder', String(section.sortOrder));
    await onSave(fd);
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.set('id', section.id);
    fd.set('type', section.type);
    fd.set('title', title);
    fd.set('subtitle', subtitle);
    fd.set('settings', JSON.stringify(section.settings || {}));
    fd.set('enabled', String(section.enabled));
    fd.set('sortOrder', String(section.sortOrder));
    await onSave(fd);
    setExpanded(false);
  };

  const typeLabels: Record<string, string> = {
    hero: 'Hero', 'category-grid': 'Category Grid', 'featured-products': 'Featured Products',
    brands: 'Brands', cta: 'CTA',
  };

  return (
    <div className={`rounded-lg border bg-card transition ${section.enabled ? 'border-border' : 'border-red-200 opacity-60'}`}>
      <div className="flex items-center gap-3 p-4">
        <span className="text-xs text-muted font-mono w-6">{index + 1}</span>
        <button onClick={() => setExpanded(v => !v)} className="flex-1 text-left">
          <span className="text-sm font-medium text-primary">{title || typeLabels[section.type] || section.type}</span>
          <span className="ml-2 text-xs text-muted capitalize">{section.type}</span>
        </button>
        <button onClick={handleToggle}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${section.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {section.enabled ? 'On' : 'Off'}
        </button>
        <button onClick={async () => { await onDelete(section.id); }}
          className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition">✕</button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3 bg-surface">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Subtitle</label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                className="w-full rounded border border-border px-3 py-1.5 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setExpanded(false)}
              className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-surface transition">Cancel</button>
            <button onClick={handleSave}
              className="rounded bg-primary px-4 py-1.5 text-xs text-white hover:bg-primary-hover transition">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

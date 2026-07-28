'use client';

import { useState, useRef } from 'react';

const SECTION_TYPES: Record<string, { label: string; icon: string }> = {
  hero: { label: 'Hero', icon: '🏠' },
  'category-grid': { label: 'Category Grid', icon: '📂' },
  'featured-products': { label: 'Featured Products', icon: '⭐' },
  brands: { label: 'Brands', icon: '🏢' },
  cta: { label: 'CTA', icon: '📣' },
};

export function SectionEditor({ section, index, total, onSave, onDelete, onMoveUp, onMoveDown }: {
  section: any; index: number; total: number;
  onSave: (data: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: (id: string) => Promise<void>;
  onMoveDown: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(section.title || '');
  const [subtitle, setSubitle] = useState(section.subtitle || '');
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const s = typeof section.settings === 'object' ? section.settings : {};
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(s as Record<string, unknown>)) flat[k] = String(v ?? '');
    return flat;
  });
  const dragRef = useRef<HTMLDivElement>(null);

  const setS = (k: string, v: string) => setSettings(p => ({ ...p, [k]: v }));

  const typeFields: Record<string, { key: string; label: string }[]> = {
    hero: [
      { key: 'tagline', label: 'Tagline' },
      { key: 'description', label: 'Description' },
      { key: 'cta', label: 'CTA Button' },
      { key: 'ctaLink', label: 'CTA Link' },
    ],
    'category-grid': [
      { key: 'heading', label: 'Heading' },
    ],
    'featured-products': [
      { key: 'heading', label: 'Section heading' },
    ],
    brands: [
      { key: 'heading', label: 'Section heading' },
    ],
    cta: [
      { key: 'buttonLabel', label: 'Button Label' },
      { key: 'buttonLink', label: 'Button Link' },
    ],
  };

  const handleAction = async (action: 'save' | 'publish' | 'unpublish' | 'toggle') => {
    const fd = new FormData();
    fd.set('id', section.id);
    fd.set('type', section.type);
    fd.set('title', title);
    fd.set('subtitle', subtitle);
    fd.set('sortOrder', String(section.sortOrder));
    fd.set('settings', JSON.stringify(settings));
    if (action === 'save')         { fd.set('status', 'draft'); fd.set('enabled', String(section.enabled)); }
    else if (action === 'publish') { fd.set('status', 'published'); fd.set('enabled', 'true'); }
    else if (action === 'unpublish') { fd.set('status', 'draft'); fd.set('enabled', 'false'); }
    else if (action === 'toggle')  { fd.set('status', section.status || 'published'); fd.set('enabled', String(!section.enabled)); }
    await onSave(fd);
    if (action !== 'toggle') setExpanded(false);
  };

  const typeInfo = SECTION_TYPES[section.type] || { label: section.type, icon: '📄' };
  const isDraft = section.status === 'draft';
  const fields = typeFields[section.type] || [];

  return (
    <div ref={dragRef} className={`rounded-lg border bg-card transition ${section.enabled ? 'border-border' : 'border-red-200 opacity-60'} ${isDraft ? 'border-dashed border-amber-300' : ''}`}>
      {/* Header — click to expand */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onMoveUp(section.id)} disabled={index === 0}
            className="text-xs text-muted hover:text-primary disabled:opacity-20 p-1" title="Move up">▲</button>
          <button onClick={() => onMoveDown(section.id)} disabled={index === total - 1}
            className="text-xs text-muted hover:text-primary disabled:opacity-20 p-1" title="Move down">▼</button>
        </div>
        <span className="text-sm">{typeInfo.icon}</span>
        <button onClick={() => setExpanded(v => !v)} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary truncate">{title || typeInfo.label}</span>
            {isDraft && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">DRAFT</span>}
          </div>
        </button>
        <span className="text-xs text-muted">#{index + 1}</span>
        <button onClick={() => handleAction('toggle')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${section.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {section.enabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-surface">
          {/* Section type badge */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{typeInfo.label}</span>
            {isDraft && <span className="text-xs text-amber-600">Not published</span>}
          </div>

          {/* Title + Subtitle */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Section Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Subtitle</label>
              <input value={subtitle} onChange={e => setSubitle(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          {/* Type-specific fields */}
          {fields.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Settings</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-muted mb-1">{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setS(f.key, e.target.value)}
                      className="w-full rounded border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <button onClick={() => handleAction('unpublish')}
              className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface transition">Unpublish</button>

            <div className="flex items-center gap-2">
              <button onClick={() => setExpanded(false)}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface transition">Cancel</button>
              <button onClick={() => handleAction('save')}
                className="rounded border border-primary px-4 py-1.5 text-xs font-medium text-primary hover:bg-surface transition">Save Draft</button>
              <button onClick={() => handleAction('publish')}
                className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition">Publish</button>
            </div>

            <button onClick={() => onDelete(section.id)}
              className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

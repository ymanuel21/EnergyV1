'use client';

import { useState, useRef } from 'react';
import { sectionRegistry } from '@/lib/section-registry';
import type { SectionField } from '@/lib/section-registry';
import { ProductPickerField as ProductPicker } from '@/components/admin/ProductPickerField';

export function SectionEditor({ section, index, total, editingId, onSave, onDelete, onMoveUp, onMoveDown }: {
  section: any; index: number; total: number; editingId?: string; onSave: (data: FormData) => Promise<void>; onDelete: (id: string) => Promise<void>; onMoveUp: (id: string) => Promise<void>; onMoveDown: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(editingId === section.id);
  const [title, setTitle] = useState(section.title || '');
  const [subtitle, setSubitle] = useState(section.subtitle || '');
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const s = typeof section.settings === 'object' ? section.settings : {};
    const flat: Record<string, any> = {};
    for (const [k, v] of Object.entries(s as Record<string, unknown>)) flat[k] = v ?? '';
    return flat;
  });
  const dragRef = useRef<HTMLDivElement>(null);

  const setS = (k: string, v: any) => setSettings(p => ({ ...p, [k]: v }));

  const def = sectionRegistry[section.type];
  const typeInfo = def || { label: section.type, icon: '📄', type: section.type };
  const fields: SectionField[] = def?.fields || [];

  const contentFields = fields.filter(f => (f.group === 'content' || !f.group)
    && (f.type !== 'product-picker' || settings.source === 'manual'));
  const stylingFields = fields.filter(f => f.group === 'styling');
  const advancedFields = fields.filter(f => f.group === 'advanced');

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

  function renderField(field: SectionField) {
    const value = settings[field.key] ?? field.defaultValue ?? '';
    const inputClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';

    switch (field.type) {
      case 'textarea':
        return <textarea value={String(value)} onChange={e => setS(field.key, e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={field.placeholder} />;
      case 'number':
        return <input type="number" value={Number(value) || 0} onChange={e => setS(field.key, parseInt(e.target.value) || 0)} className={`${inputClass} w-24`} />;
      case 'toggle':
        return (
          <button type="button" onClick={() => setS(field.key, !value)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? 'bg-primary' : 'bg-border'}`}
            role="switch" aria-checked={!!value}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${value ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        );
      case 'select':
        return (
          <select value={String(value)} onChange={e => setS(field.key, e.target.value)} className={inputClass}>
            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        );
      case 'alignment':
        return (
          <div className="flex gap-1">
            {[{ v: 'left', l: '⟵' }, { v: 'center', l: '⟷' }, { v: 'right', l: '⟶' }].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => setS(field.key, v)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition ${value === v ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-border'}`}>{l}</button>
            ))}
          </div>
        );
      case 'product-picker':
        return <ProductPicker value={Array.isArray(value) ? value : []} onChange={(ids) => setS(field.key, ids)} single={(field as any).single} />;
      case 'image':
        return (
          <div className="flex items-center gap-2">
            {value && <img src={String(value)} alt="" className="h-10 w-10 rounded-lg object-cover border border-border shrink-0" />}
            <input type="text" value={String(value)} onChange={e => setS(field.key, e.target.value)}
              className={`${inputClass} flex-1`} placeholder={field.placeholder || 'Image URL'} />
            <button type="button" onClick={() => window.open('/admin/media', '_blank')}
              className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-xs text-muted hover:bg-surface transition whitespace-nowrap">Media ↗</button>
          </div>
        );
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <input type="color" value={String(value)} onChange={e => setS(field.key, e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-border" />
            <input type="text" value={String(value)} onChange={e => setS(field.key, e.target.value)} className={`${inputClass} w-28 font-mono`} />
          </div>
        );
      default:
        return <input type="text" value={String(value)} onChange={e => setS(field.key, e.target.value)} className={inputClass} placeholder={field.placeholder} />;
    }
  }

  function FieldGroup({ label, fields }: { label: string; fields: SectionField[] }) {
    if (!fields.length) return null;
    return (
      <details className="group" open={label === 'Content'}>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary transition py-1">{label} ▼</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {fields.map(f => (
            <div key={f.key} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-xs font-medium text-muted">{f.label}</label>
              {renderField(f)}
            </div>
          ))}
        </div>
      </details>
    );
  }

  const isDraft = section.status === 'draft';

  return (
    <div ref={dragRef} className={`rounded-lg border bg-card transition ${section.enabled ? 'border-border' : 'border-red-200 opacity-60'} ${isDraft ? 'border-dashed border-amber-300' : ''}`}>
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

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-surface">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{typeInfo.label}</span>
            {isDraft && <span className="text-xs text-amber-600">Not published</span>}
          </div>

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

          <FieldGroup label="Content" fields={contentFields} />
          <FieldGroup label="Styling" fields={stylingFields} />
          <FieldGroup label="Advanced" fields={advancedFields} />

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

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { sectionRegistry } from '@/lib/section-registry';
import { COLOR_MAP } from '@/lib/section-registry';
import type { SectionField } from '@/lib/section-registry';
import { Button } from '@ui/Button';

/* ══════════════════════════════════════════════════════════════
   HomepageBuilder — Visual CMS with live preview
   ══════════════════════════════════════════════════════════════ */

export function HomepageBuilder({ initialSections, onSave, onDelete, onMoveUp, onMoveDown, onAdd }: {
  initialSections: any[];
  onSave: (data: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: (id: string) => Promise<void>;
  onMoveDown: (id: string) => Promise<void>;
  onAdd: (type: string) => Promise<void>;
}) {
  const [sections, setSections] = useState(initialSections);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Content');
  const [previewWidth, setPreviewWidth] = useState<string>('100%');
  const [previewKey, setPreviewKey] = useState(0);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSections(initialSections); }, [initialSections]);

  const editing = editingId ? sections.find(s => s.id === editingId) : null;
  const def = editing ? sectionRegistry[editing.type] : null;

  // Initialize editor when selecting a section
  const selectSection = useCallback((id: string) => {
    if (dirty && id !== editingId) {
      setPendingEditId(id);
      return;
    }
    const sec = sections.find(s => s.id === id);
    if (!sec) return;
    setEditingId(id);
    setTitle(sec.title || '');
    setSubtitle(sec.subtitle || '');
    setSettings(typeof sec.settings === 'object' ? { ...sec.settings } : {});
    setDirty(false);
    setActiveTab('Content');
  }, [sections, dirty, editingId]);

  // Discard unsaved changes
  const discardChanges = useCallback(() => {
    setDirty(false);
    if (pendingEditId) {
      const sec = sections.find(s => s.id === pendingEditId);
      if (sec) {
        setEditingId(pendingEditId);
        setTitle(sec.title || '');
        setSubtitle(sec.subtitle || '');
        setSettings(typeof sec.settings === 'object' ? { ...sec.settings } : {});
        setActiveTab('Content');
      }
      setPendingEditId(null);
    }
  }, [sections, pendingEditId]);

  // Save (draft or publish)
  const handleSave = useCallback(async (action: 'draft' | 'publish' | 'unpublish') => {
    if (!editing) return;
    setSaving(true);
    setSaved(false);

    // Optimistic local update
    const updatedSections = sections.map(s =>
      s.id === editing.id ? { ...s, title, subtitle, settings, status: action === 'publish' ? 'published' : 'draft', enabled: action !== 'unpublish' } : s
    );
    setSections(updatedSections);

    const fd = new FormData();
    fd.set('id', editing.id); fd.set('type', editing.type);
    fd.set('title', title); fd.set('subtitle', subtitle);
    fd.set('sortOrder', String(editing.sortOrder));
    fd.set('settings', JSON.stringify(settings));
    if (action === 'publish') { fd.set('status', 'published'); fd.set('enabled', 'true'); }
    else if (action === 'draft') { fd.set('status', 'draft'); fd.set('enabled', String(editing.enabled)); }
    else { fd.set('status', 'draft'); fd.set('enabled', 'false'); }

    // Show loading overlay on preview
    setPreviewLoading(true);
    await onSave(fd);
    setDirty(false);
    setSaving(false);
    setSaved(true);

    // Clear saved badge after 2s
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);

    // Force iframe to reload, hide loading when done
    setPreviewKey(k => k + 1);
    setTimeout(() => setPreviewLoading(false), 800);
  }, [editing, title, subtitle, settings, sections, onSave]);

  // Toggle enabled
  const handleToggle = useCallback(async () => {
    if (!editing) return;
    const fd = new FormData();
    fd.set('id', editing.id); fd.set('type', editing.type);
    fd.set('title', title); fd.set('subtitle', subtitle);
    fd.set('sortOrder', String(editing.sortOrder));
    fd.set('settings', JSON.stringify(settings));
    fd.set('status', editing.status || 'published');
    fd.set('enabled', String(!editing.enabled));
    await onSave(fd);
  }, [editing, title, subtitle, settings, onSave]);

  const fieldGroups: Record<string, SectionField[]> = { Content: [], Style: [], Display: [], Advanced: [] };
  if (def) {
    for (const f of def.fields) {
      const g = f.group || 'Content';
      if (g === 'styling') fieldGroups.Style.push(f);
      else if (g === 'advanced') fieldGroups.Advanced.push(f);
      else if (g === 'content') fieldGroups.Content.push(f);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ── Left Sidebar — Section List ── */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-primary">Sections</h2>
          <span className="text-xs text-muted">{sections.length}</span>
        </div>
        <div className="space-y-1">
          {sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s} index={i} total={sections.length}
              isActive={s.id === editingId}
              onClick={() => selectSection(s.id)}
              onToggle={async () => {
                const fd = new FormData();
                fd.set('id', s.id); fd.set('type', s.type);
                fd.set('title', s.title || ''); fd.set('subtitle', s.subtitle || '');
                fd.set('sortOrder', String(s.sortOrder));
                fd.set('settings', JSON.stringify(s.settings || {}));
                fd.set('status', s.status || 'published');
                fd.set('enabled', String(!s.enabled));
                await onSave(fd);
                setPreviewKey(k => k + 1);
              }}
              onDuplicate={async () => { await onAdd(s.type); }}
              onDelete={() => onDelete(s.id)}
              onMoveUp={() => onMoveUp(s.id)}
              onMoveDown={() => onMoveDown(s.id)}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted mb-2">Add Section</p>
          <div className="grid gap-1">
            {Object.values(sectionRegistry).map(({ type, label, icon }) => (
              <button key={type} onClick={() => onAdd(type)}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs text-muted hover:bg-surface hover:text-primary transition text-left">
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Center — Preview ── */}
      <main className="flex-1 overflow-auto bg-surface">
        {/* Preview toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-card border-b border-border px-4 py-2">
          <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
            {[{ label: 'Desktop', w: '100%' }, { label: 'Tablet', w: '768px' }, { label: 'Mobile', w: '375px' }].map(opt => (
              <button key={opt.label} onClick={() => setPreviewWidth(opt.w)}
                className={`rounded px-3 py-1 text-xs transition ${previewWidth === opt.w ? 'bg-card shadow text-primary font-medium' : 'text-muted hover:text-primary'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {saving && <span className="text-amber-600 animate-pulse">Saving...</span>}
            {saved && <span className="text-green-600 font-medium">✓ Saved</span>}
            {!saving && !saved && dirty && <span className="text-amber-600">Unsaved</span>}
            {!saving && !saved && !dirty && editingId && <span className="text-green-600">● Ready</span>}
          </div>
        </div>
        {/* Preview iframe with loading overlay */}
        <div className="relative" style={{ height: 'calc(100vh - 8rem)', maxWidth: previewWidth, margin: '0 auto' }}>
          {previewLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm border border-border">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                <span className="text-xs text-muted">Refreshing preview...</span>
              </div>
            </div>
          )}
          <iframe key={previewKey} src="/?preview=true" className="w-full h-full border-0" title="Preview" />
        </div>
      </main>

      {/* ── Right Panel — Editor ── */}
      {editing && (
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-border bg-card">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span>{def?.icon}</span>
                <span className="text-sm font-semibold text-primary">{def?.label}</span>
              </div>
              <button onClick={() => { if (dirty) setPendingEditId(null); setEditingId(null); setDirty(false); }}
                className="text-muted hover:text-primary text-lg leading-none">×</button>
            </div>

            {/* Title + Subtitle */}
            <div className="space-y-2 mb-4">
              <input value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }}
                placeholder="Section Title" className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              <input value={subtitle} onChange={e => { setSubtitle(e.target.value); setDirty(true); }}
                placeholder="Subtitle" className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-border mb-3">
              {Object.keys(fieldGroups).filter(k => fieldGroups[k].length > 0).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {(fieldGroups[activeTab] || []).map(field => (
                <div key={field.key}>
                  <label className="mb-1 block text-xs font-medium text-muted">{field.label}</label>
                  <EditorField
                    field={field} value={settings[field.key] ?? field.defaultValue ?? ''}
                    onChange={(v: any) => { setSettings(p => ({ ...p, [field.key]: v })); setDirty(true); }}
                  />
                  {field.key === 'buttonLabel' && <p className="text-[10px] text-muted mt-0.5">Leave empty to hide button.</p>}
                  {field.key === 'maxProjects' && <p className="text-[10px] text-muted mt-0.5">0 means show all.</p>}
                </div>
              ))}
              {fieldGroups[activeTab]?.length === 0 && <p className="text-xs text-muted">No settings for this tab.</p>}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" isLoading={saving} loadingText="Saving..." onClick={() => handleSave('draft')}>Save Draft</Button>
                <Button variant="primary" size="sm" isLoading={saving} loadingText="Publishing..." onClick={() => handleSave('publish')}>Publish</Button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleToggle}
                  className={`flex-1 rounded border px-3 py-2 text-xs font-medium transition ${editing.enabled ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'}`}>
                  {editing.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button onClick={() => onDelete(editing.id)}
                  className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition">Delete</button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Unsaved changes dialog */}
      {pendingEditId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-xl p-6 shadow-xl max-w-sm">
            <h3 className="text-sm font-semibold text-primary">Unsaved changes</h3>
            <p className="mt-1 text-xs text-muted">You have unsaved changes. Discard or save before switching.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setPendingEditId(null); discardChanges(); }}
                className="flex-1 rounded border border-border px-3 py-2 text-xs text-muted hover:bg-surface transition">Discard</button>
              <button onClick={async () => { await handleSave('draft'); discardChanges(); }}
                className="flex-1 rounded bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover transition">Save Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Section Card
   ══════════════════════════════════════════════ */

function SectionCard({ section, index, total, isActive, onClick, onToggle, onDuplicate, onDelete, onMoveUp, onMoveDown }: {
  section: any; index: number; total: number; isActive: boolean;
  onClick: () => void; onToggle: () => void; onDuplicate: () => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
}) {
  const def = sectionRegistry[section.type];
  const isDraft = section.status === 'draft';
  return (
    <div className={`rounded-lg border transition cursor-pointer group ${isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'}`}>
      <div className="flex items-center gap-2 px-3 py-2" onClick={onClick}>
        <div className="flex flex-col items-center text-[10px] text-muted">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0} className="hover:text-primary disabled:opacity-20">▲</button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1} className="hover:text-primary disabled:opacity-20">▼</button>
        </div>
        <span className="text-sm">{def?.icon || '📄'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary truncate">{section.title || def?.label}</p>
          <p className="text-[10px] text-muted">
            {section.status === 'draft' ? 'Draft' : section.enabled ? 'Published' : 'Disabled'}
          </p>
        </div>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 text-[10px] text-muted hover:text-primary" title="Duplicate">⧉</button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1 text-[10px] text-muted hover:text-primary" title="Toggle">◉</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Editor Field — renders based on field type
   ══════════════════════════════════════════════ */

function EditorField({ field, value, onChange }: { field: SectionField; value: any; onChange: (v: any) => void }) {
  // Route styling fields to visual presets
  const stylingKeys = ['_background', 'bgColor', '_container', '_padding', '_borderRadius', '_shadow', 'overlayOpacity', '_textColor'];
  if (stylingKeys.includes(field.key)) {
    return <StylingField field={field} value={value} onChange={onChange} />;
  }
  const inputClass = 'w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';
  switch (field.type) {
    case 'textarea':
      return <textarea value={String(value)} onChange={e => onChange(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder={field.placeholder} />;
    case 'number':
      return <input type="number" value={Number(value) || 0} onChange={e => onChange(parseInt(e.target.value) || 0)} className={`${inputClass} w-20`} />;
    case 'toggle':
      return (
        <button type="button" onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? 'bg-primary' : 'bg-border'}`} role="switch" aria-checked={!!value}>
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${value ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      );
    case 'select':
      return (
        <select value={String(value)} onChange={e => onChange(e.target.value)} className={inputClass}>
          {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    case 'alignment':
      return (
        <div className="flex gap-1">
          {[{ v: 'left', l: '⟵' }, { v: 'center', l: '⟷' }, { v: 'right', l: '⟶' }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => onChange(v)}
              className={`h-8 w-8 rounded text-sm font-medium transition ${value === v ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-border'}`}>{l}</button>
          ))}
        </div>
      );
    case 'image':
      return (
        <div className="space-y-1">
          {value && <img src={String(value)} alt="" className="h-12 w-12 rounded object-cover border border-border" />}
          <input type="text" value={String(value)} onChange={e => onChange(e.target.value)} className={inputClass} placeholder="Image URL" />
          <button type="button" onClick={() => window.open('/admin/media', '_blank')} className="text-[10px] text-primary hover:underline">Media Library →</button>
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={String(value)} onChange={e => onChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded border border-border" />
          <input type="text" value={String(value)} onChange={e => onChange(e.target.value)} className={`${inputClass} w-24 font-mono`} />
        </div>
      );
    default:
      return <input type="text" value={String(value)} onChange={e => onChange(e.target.value)} className={inputClass} placeholder={field.placeholder} />;
  }
}

/* ── StylingField — visual presets ── */

function StylingField({ field, value, onChange }: { field: SectionField; value: any; onChange: (v: any) => void }) {
  const k = field.key;

  if (k === '_background') {
    const colorEntries = Object.entries(COLOR_MAP);
    const isCustom = value === 'custom';
    return (
      <div>
        <div className="grid grid-cols-5 gap-1.5 mb-1.5">
          {colorEntries.map(([key, c]) => (
            <button key={key} type="button" onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition ${value === key && !isCustom ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'}`}>
              <div className={`h-5 w-10 rounded border ${c.border} ${c.bg}`}>
                {key === 'none' && <div className="h-full w-full rounded opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(#999 0% 25%, transparent 0% 50%)', backgroundSize: '4px 4px' }} />}
              </div>
              <span className="text-[9px] text-muted">{c.label}</span>
            </button>
          ))}
          <button type="button" onClick={() => onChange('custom')}
            className={`flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition ${isCustom ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'} col-span-1`}>
            <div className="h-5 w-10 rounded border border-border bg-[repeating-conic-gradient(#999_0%_25%,transparent_0%_50%)] bg-[length:4px_4px]" />
            <span className="text-[9px] text-muted">Custom</span>
          </button>
        </div>
        {isCustom && (
          <input type="text" value={String(value)} onChange={e => onChange(e.target.value)}
            className="w-full rounded border border-border px-2 py-1 text-[10px] font-mono focus:border-primary outline-none bg-card" placeholder="#0055FF" />
        )}
        {isCustom && /^#[0-9a-fA-F]{3,8}$/.test(String(value)) && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border" style={{ backgroundColor: String(value) }} />
            <span className="text-[10px] text-muted">Live preview</span>
          </div>
        )}
      </div>
    );
  }

  if (k === 'bgColor' || k === '_textColor') {
    const colorEntries = Object.entries(COLOR_MAP);
    return (
      <div>
        <div className="grid grid-cols-4 gap-1.5 mb-1.5">
          {colorEntries.map(([key, c]) => (
            <button key={key} type="button" onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition ${value === key ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'}`}>
              <div className={`h-5 w-10 rounded border ${c.border} ${c.bg}`}>
                {key === 'none' && <div className="h-full w-full rounded opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(#999 0% 25%, transparent 0% 50%)', backgroundSize: '4px 4px' }} />}
              </div>
              <span className="text-[9px] text-muted">{c.label}</span>
            </button>
          ))}
        </div>
        <input type="text" value={String(value)} onChange={e => onChange(e.target.value)}
          className="w-full rounded border border-border px-2 py-1 text-[10px] font-mono focus:border-primary outline-none bg-card" placeholder="Custom #HEX" />
        {/^#[0-9a-fA-F]{3,8}$/.test(String(value)) && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border" style={{ backgroundColor: String(value) }} />
            <span className="text-[10px] text-muted">Live preview</span>
          </div>
        )}
      </div>
    );
  }

  if (k === '_container') {
    const widths = [
      { v: 'boxed', label: 'Boxed', w: 'w-3/4' },
      { v: 'wide', label: 'Wide', w: 'w-[90%]' },
      { v: 'full', label: 'Full Width', w: 'w-full' },
    ];
    return (
      <div className="space-y-1.5">
        {widths.map(w => (
          <button key={w.v} type="button" onClick={() => onChange(w.v)}
            className={`w-full rounded-lg border px-3 py-2 transition text-left ${value === w.v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <div className="flex justify-center mb-1"><span className={`h-2 rounded bg-primary/20 ${w.w}`} /></div>
            <span className="text-[10px] font-medium text-primary">{w.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (k === '_padding') {
    const spacings = [
      { v: 'compact', label: 'Compact', bars: [8,6,4] },
      { v: 'default', label: 'Default', bars: [12,10,8] },
      { v: 'spacious', label: 'Spacious', bars: [18,14,12] },
    ];
    return (
      <div className="space-y-1.5">
        {spacings.map(s => (
          <button key={s.v} type="button" onClick={() => onChange(s.v)}
            className={`w-full rounded-lg border px-3 py-2 transition ${value === s.v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="flex flex-col gap-0.5" style={{ height: 28 }}>
                <div className="w-4 rounded bg-primary/40" style={{ height: s.bars[0] }} />
                <div className="w-4 rounded bg-primary/30" style={{ height: s.bars[1] }} />
                <div className="w-4 rounded bg-primary/20" style={{ height: s.bars[2] }} />
              </div>
              <span className="text-[10px] font-medium text-primary">{s.label}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (k === '_borderRadius') {
    const radii = ['square', 'small', 'medium', 'large', 'pill'];
    return (
      <div className="flex gap-1.5">
        {radii.map(r => (
          <button key={r} type="button" onClick={() => onChange(r)}
            className={`flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 transition ${value === r ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <div className={`h-5 w-8 border border-border bg-primary/15 ${r === 'square' ? '' : r === 'pill' ? 'rounded-full' : r === 'large' ? 'rounded-lg' : r === 'medium' ? 'rounded-md' : 'rounded'}`} />
            <span className="text-[9px] text-muted capitalize">{r}</span>
          </button>
        ))}
      </div>
    );
  }

  if (k === '_shadow') {
    const shadows = [
      { v: 'none', s: '' },
      { v: 'sm', s: 'rgba(0,0,0,0.06) 0px 1px 2px' },
      { v: 'md', s: 'rgba(0,0,0,0.1) 0px 4px 6px' },
      { v: 'lg', s: 'rgba(0,0,0,0.1) 0px 10px 25px' },
    ];
    return (
      <div className="flex gap-1.5">
        {shadows.map(sh => (
          <button key={sh.v} type="button" onClick={() => onChange(sh.v)}
            className={`flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 transition ${value === sh.v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
            <div className="h-5 w-8 rounded bg-white border border-border" style={{ boxShadow: sh.s }} />
            <span className="text-[9px] text-muted">{sh.v === 'none' ? 'None' : sh.v}</span>
          </button>
        ))}
      </div>
    );
  }

  if (k === 'overlayOpacity') {
    const pct = Number(value) || 0;
    return (
      <div className="flex items-center gap-2">
        <input type="range" min={0} max={80} value={pct} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-border accent-primary cursor-pointer" />
        <span className="text-[10px] text-muted w-7 text-right">{pct}%</span>
      </div>
    );
  }

  return <input type="text" value={String(value)} onChange={e => onChange(e.target.value)}
    className="w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />;
}

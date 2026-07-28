'use client';

import { useState, useCallback } from 'react';

const DEFAULT_VALUES: Record<string, string> = {
  primary: '#111827',
  primary_hover: '#1F2937',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E5E7EB',
  accent: '#10B981',
  dark_bg: '#111827',
  radius_sm: '8',
  radius_md: '12',
  radius_lg: '24',
  radius_full: '9999',
  container: '1024',
  heading_weight: '300',
  shadow_card: '0 1px 3px rgba(0,0,0,0.08)',
  shadow_lg: '0 10px 25px rgba(0,0,0,0.08)',
};

interface Props {
  settings: Record<string, string>;
  onSave: (data: FormData) => Promise<void>;
}

export function AppearanceForm({ settings, onSave }: Props) {
  const [tab, setTab] = useState<'colors'|'typography'|'layout'|'buttons'|'cards'>('colors');
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const k of Object.keys(DEFAULT_VALUES)) {
      const dbKey = 'theme_' + k;
      const draftKey = 'theme_draft_' + k;
      v[k] = settings[draftKey] || settings[dbKey] || DEFAULT_VALUES[k];
    }
    return v;
  });
  const [saving, setSaving] = useState(false);

  const setVal = useCallback((key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    const fd = new FormData();
    if (publish) fd.set('_publish', 'true');
    for (const [k, v] of Object.entries(values)) fd.set(k, v);
    await onSave(fd);
    setSaving(false);
  };

  const cssVars = {
    '--ebt-primary': values.primary,
    '--ebt-primary-hover': values.primary_hover,
    '--ebt-surface': values.surface,
    '--ebt-card': values.card,
    '--ebt-muted': values.muted,
    '--ebt-border': values.border,
    '--ebt-accent': values.accent,
    '--ebt-dark-bg': values.dark_bg,
    '--ebt-radius-sm': values.radius_sm + 'px',
    '--ebt-radius-md': values.radius_md + 'px',
    '--ebt-radius-lg': values.radius_lg + 'px',
    '--ebt-radius-full': values.radius_full + 'px',
    '--ebt-container': values.container + 'px',
    '--ebt-heading-weight': values.heading_weight,
    '--ebt-shadow-card': values.shadow_card,
    '--ebt-shadow-lg': values.shadow_lg,
  } as React.CSSProperties;

  const tabs = ['colors', 'typography', 'layout', 'buttons', 'cards'] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Colors Tab */}
        {tab === 'colors' && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { k: 'primary', l: 'Primary', d: 'Buttons, links, headings' },
              { k: 'primary_hover', l: 'Primary Hover', d: 'Button hover states' },
              { k: 'accent', l: 'Accent', d: 'Highlights, decorative elements' },
              { k: 'surface', l: 'Surface', d: 'Page background, section bg' },
              { k: 'card', l: 'Card', d: 'Card backgrounds' },
              { k: 'border', l: 'Border', d: 'Card borders, dividers' },
              { k: 'muted', l: 'Muted Text', d: 'Secondary text, labels' },
              { k: 'dark_bg', l: 'Dark BG', d: 'CTA sections, footer' },
            ].map(({ k, l, d }) => (
              <div key={k} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{l}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={values[k]} onChange={e => setVal(k, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 p-0" />
                    <input type="text" value={values[k]} onChange={e => setVal(k, e.target.value)}
                      className="w-24 rounded border border-gray-200 px-2 py-1 text-xs font-mono" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        )}

        {/* Typography Tab */}
        {tab === 'typography' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading Weight</label>
              <div className="flex items-center gap-3">
                <input type="range" min="100" max="900" step="100" value={values.heading_weight}
                  onChange={e => setVal('heading_weight', e.target.value)} className="flex-1" />
                <span className="w-12 text-right text-sm font-mono">{values.heading_weight}</span>
              </div>
              <p className="mt-3 text-xs text-gray-400">Preview:</p>
              <h2 style={{ fontWeight: Number(values.heading_weight) }} className="text-2xl text-gray-900">
                Heading Preview
              </h2>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {tab === 'layout' && (
          <div className="space-y-4">
            {[
              { k: 'radius_md', l: 'Card Border Radius', min: 0, max: 40, unit: 'px' },
              { k: 'radius_lg', l: 'Large Border Radius', min: 0, max: 60, unit: 'px' },
              { k: 'container', l: 'Container Width', min: 640, max: 1440, unit: 'px' },
            ].map(({ k, l, min, max, unit }) => (
              <div key={k} className="rounded-xl border border-gray-200 bg-white p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{l}</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={min} max={max} value={values[k]}
                    onChange={e => setVal(k, e.target.value)} className="flex-1" />
                  <span className="w-16 text-right text-sm font-mono">{values[k]}{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons Tab */}
        {tab === 'buttons' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <p className="text-xs text-gray-400 mb-4">Button previews using current theme</p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition" style={{ background: values.primary }}>
                Primary Button
              </button>
              <button className="rounded-lg border px-6 py-2.5 text-sm font-medium transition" style={{ borderColor: values.primary, color: values.primary }}>
                Outline Button
              </button>
              <button className="rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm transition" style={{ background: values.primary, borderRadius: '9999px' }}>
                Pill Button
              </button>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {tab === 'cards' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <p className="text-xs text-gray-400 mb-4">Card preview using current theme</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border bg-white shadow-sm" style={{ borderColor: values.border, borderRadius: values.radius_md + 'px' }}>
                <div className="h-32 flex items-center justify-center" style={{ background: values.surface }}>
                  <span className="text-3xl">📦</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium" style={{ color: values.primary }}>Product Card</h3>
                  <p className="mt-1 text-xs" style={{ color: values.muted }}>Rp 1.450.000</p>
                </div>
              </div>
              <div className="rounded-xl border p-6 shadow-sm" style={{ borderColor: values.border, borderRadius: values.radius_md + 'px', background: values.card }}>
                <h3 className="font-medium" style={{ color: values.primary }}>Category Card</h3>
                <p className="mt-1 text-xs" style={{ color: values.muted }}>12 products</p>
              </div>
            </div>
          </div>
        )}

        {/* Save buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button onClick={() => handleSave(false)} disabled={saving}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:opacity-50" style={{ background: values.primary }}>
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 lg:sticky lg:top-20" style={cssVars}>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
        <div className="space-y-3 scale-[0.85] origin-top-left" style={{ width: '118%' }}>

          {/* Mini Header */}
          <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: values.card, borderColor: values.border, borderWidth: 1 }}>
            <span className="text-sm font-semibold" style={{ color: values.primary }}>EBTPlaza</span>
            <div className="flex gap-2">
              <div className="h-2 w-12 rounded" style={{ background: values.muted, opacity: 0.3 }} />
              <div className="h-2 w-12 rounded" style={{ background: values.muted, opacity: 0.3 }} />
            </div>
          </div>

          {/* Mini Hero */}
          <div className="rounded-lg p-4 space-y-2" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, ' + values.surface + ' 100%)' }}>
            <h2 className="text-lg leading-tight" style={{ fontWeight: Number(values.heading_weight), color: values.primary }}>
              Tenaga surya<br /><span style={{ fontWeight: 600 }}>untuk semua.</span>
            </h2>
            <p className="text-xs" style={{ color: values.muted }}>Produk berkualitas premium untuk kebutuhan energi Anda.</p>
            <div className="flex gap-2 mt-2">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: values.primary, borderRadius: values.radius_full + 'px' }}>
                Jelajahi Katalog
              </span>
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium" style={{ color: values.muted }}>
                Konsultasi →
              </span>
            </div>
          </div>

          {/* Mini Cards */}
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-lg border p-2" style={{ borderColor: values.border, borderRadius: values.radius_md + 'px', background: values.card }}>
                <div className="h-10 rounded flex items-center justify-center mb-1" style={{ background: values.surface }}>
                  <span className="text-xs">📦</span>
                </div>
                <div className="h-1.5 w-3/4 rounded" style={{ background: values.muted, opacity: 0.3 }} />
                <div className="h-1.5 w-1/2 rounded mt-1" style={{ background: values.muted, opacity: 0.2 }} />
              </div>
            ))}
          </div>

          {/* Mini Footer */}
          <div className="rounded-lg p-3" style={{ background: values.dark_bg }}>
            <span className="text-xs font-semibold text-white">EBTPlaza</span>
            <p className="text-xs mt-1" style={{ color: values.muted }}>Energi terbarukan untuk semua.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

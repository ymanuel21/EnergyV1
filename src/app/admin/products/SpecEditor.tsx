'use client';

import { useState, useEffect } from 'react';

interface Specification { key: string; value: string; }

interface SpecEditorProps {
  value: Specification[];
  onChange: (value: Specification[]) => void;
}

const TEMPLATES: Record<string, Specification[]> = {
  'Solar Panel': [
    { key: 'Power', value: '' }, { key: 'Efficiency', value: '' },
    { key: 'Voltage', value: '' }, { key: 'Current', value: '' },
    { key: 'Weight', value: '' }, { key: 'Dimensions', value: '' },
    { key: 'Warranty', value: '' }, { key: 'Certification', value: '' },
  ],
  Inverter: [
    { key: 'Capacity', value: '' }, { key: 'Input Voltage', value: '' },
    { key: 'Output Voltage', value: '' }, { key: 'Efficiency', value: '' },
    { key: 'Warranty', value: '' }, { key: 'Certification', value: '' },
  ],
  Battery: [
    { key: 'Capacity', value: '' }, { key: 'Voltage', value: '' },
    { key: 'Cycle Life', value: '' }, { key: 'Weight', value: '' },
    { key: 'Warranty', value: '' },
  ],
};

export function SpecEditor({ value, onChange }: SpecEditorProps) {
  const [rows, setRows] = useState<Specification[]>(
    value?.length ? value : [{ key: '', value: '' }]
  );

  // Sync when parent value changes
  useEffect(() => {
    setRows(value?.length ? value : [{ key: '', value: '' }]);
  }, [value]);

  const emit = (next: Specification[]) => {
    setRows(next);
    const valid = next.filter(s => s.key.trim());
    onChange(valid);
  };

  const update = (i: number, field: 'key' | 'value', val: string) => {
    emit(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const add = () => emit([...rows, { key: '', value: '' }]);
  const remove = (i: number) => emit(rows.filter((_, idx) => idx !== i));
  const move = (i: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? i - 1 : i + 1;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[i], next[target]] = [next[target], next[i]];
    emit(next);
  };

  const applyTemplate = (name: string) => {
    const tmpl = TEMPLATES[name];
    if (!tmpl) return;
    const existing = rows.filter(s => s.key.trim());
    emit([...existing, ...tmpl]);
  };

  const inputCls = 'w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';

  return (
    <div className="space-y-2">
      {/* Quick-add templates */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.keys(TEMPLATES).map(name => (
          <button key={name} type="button" onClick={() => applyTemplate(name)}
            className="rounded border border-border px-2 py-0.5 text-[10px] text-muted hover:border-primary hover:text-primary transition">
            + {name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-1.5 text-[10px] font-medium text-muted uppercase px-0.5">
        <span className="col-span-5">Specification</span>
        <span className="col-span-5">Value</span>
        <span className="col-span-2" />
      </div>

      {/* Rows */}
      {rows.map((spec, i) => (
        <div key={i} className="flex items-start gap-1.5 group">
          <div className="flex flex-col gap-0.5 pt-1">
            <button type="button" onClick={() => move(i, 'up')} disabled={i === 0}
              className="text-[10px] text-muted hover:text-primary disabled:opacity-20 leading-none">▲</button>
            <button type="button" onClick={() => move(i, 'down')} disabled={i === rows.length - 1}
              className="text-[10px] text-muted hover:text-primary disabled:opacity-20 leading-none">▼</button>
          </div>
          <div className="flex-1 sm:grid sm:grid-cols-12 gap-1.5">
            <input value={spec.key} onChange={e => update(i, 'key', e.target.value)}
              placeholder="e.g. Power" className={`${inputCls} sm:col-span-5`} />
            <input value={spec.value} onChange={e => update(i, 'value', e.target.value)}
              placeholder="e.g. 550Wp" className={`${inputCls} sm:col-span-5`} />
          </div>
          <button type="button" onClick={() => remove(i)}
            className="shrink-0 pt-1.5 text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">✕</button>
        </div>
      ))}

      <button type="button" onClick={add}
        className="text-xs font-medium text-primary hover:underline">
        + Add Specification
      </button>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface ProductInfoPanelProps {
  product: {
    name?: string;
    description?: string;
    shortDescription?: string;
    specifications?: Array<{ key: string; value: string }>;
    warranty?: string;
    weight?: number;
    condition?: string;
  };
}

const KEY_SPECS = ['Daya Output', 'Power Output', 'Watt Peak', 'Rating', 'Tipe', 'Type', 'Kapasitas', 'Capacity', 'Tegangan', 'Voltage'];

function getHighlightedSpecs(specifications?: Array<{ key: string; value: string }>) {
  if (!specifications?.length) return [];
  return specifications.filter(s => KEY_SPECS.some(k => s.key.toLowerCase().includes(k.toLowerCase())));
}

const tabs = ['Description', 'Spesifikasi', 'Pengiriman & Garansi'] as const;
type Tab = (typeof tabs)[number];

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const keySpecs = getHighlightedSpecs(product.specifications);

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-medium transition border-b-2 -mb-[1px] ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-3 text-sm text-muted leading-relaxed min-h-[100px] flex-1">
        {activeTab === 'Description' && (
          <p className="line-clamp-5">{(product.description || 'Deskripsi produk tidak tersedia saat ini.')}</p>
        )}

        {activeTab === 'Spesifikasi' && (
          keySpecs.length > 0 ? (
            <div className="space-y-2">
              {keySpecs.map((s, i) => (
                <div key={i} className="flex justify-between border-b border-border/50 pb-2 text-xs">
                  <span className="text-muted">{s.key}</span>
                  <span className="font-medium text-primary">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs">Spesifikasi detail tersedia di halaman produk lengkap.</p>
          )
        )}

        {activeTab === 'Pengiriman & Garansi' && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Garansi</span>
              <span className="font-medium text-primary">{product.warranty || '1 Tahun'}</span>
            </div>
            {product.weight != null && (
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted">Berat</span>
                <span className="font-medium text-primary">{product.weight} kg</span>
              </div>
            )}
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Kondisi</span>
              <span className="font-medium text-primary">{product.condition || 'Baru'}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Pengiriman</span>
              <span className="font-medium text-primary">2-7 hari kerja</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

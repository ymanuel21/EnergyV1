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

// Pick important specs to highlight (not the full table)
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
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 lg:p-8 h-full justify-between">
      {/* Product name + short desc */}
      <div>
        <h3 className="text-xl font-semibold text-primary mb-1">{product.name}</h3>
        {(product.shortDescription || product.description) && (
          <p className="text-sm text-muted line-clamp-3 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-border">
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
        <div className="mt-4 text-sm text-muted leading-relaxed min-h-[120px]">
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
              <p>Spesifikasi detail tersedia di halaman produk lengkap.</p>
            )
          )}

          {activeTab === 'Pengiriman & Garansi' && (
            <div className="space-y-3 text-xs">
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

      {/* CTA */}
      <a
        href={`/produk/${(product as any).slug || ''}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors w-fit"
      >
        Lihat Detail Produk
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </div>
  );
}

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
  showDescription?: boolean;
  showSpecifications?: boolean;
  showShipping?: boolean;
}

const KEY_SPECS = ['Output Power', 'Power Output', 'Watt Peak', 'Rating', 'Type', 'Type', 'Capacity', 'Capacity', 'Voltage', 'Voltage'];

function getHighlightedSpecs(specifications?: Array<{ key: string; value: string }>) {
  if (!specifications?.length) return [];
  return specifications.filter(s => KEY_SPECS.some(k => s.key.toLowerCase().includes(k.toLowerCase())));
}

const allTabs = ['Description', 'Specifications', 'Shipping & Warranty'] as const;
type Tab = (typeof allTabs)[number];

export function ProductInfoPanel({ product, showDescription = true, showSpecifications = true, showShipping = true }: ProductInfoPanelProps) {
  const tabs = allTabs.filter(t => {
    if (t === 'Description') return showDescription;
    if (t === 'Specifications') return showSpecifications;
    if (t === 'Shipping & Warranty') return showShipping;
    return true;
  });
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0] || 'Description');
  const keySpecs = getHighlightedSpecs(product.specifications);

  if (tabs.length === 0) return null;

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
          <p className="line-clamp-5">{(product.description || 'Product description is not available at the moment.')}</p>
        )}

        {activeTab === 'Specifications' && (
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
            <p className="text-xs">Detailed specifications are available on the full product page.</p>
          )
        )}

        {activeTab === 'Shipping & Warranty' && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Warranty</span>
              <span className="font-medium text-primary">{product.warranty || '1 Year'}</span>
            </div>
            {product.weight != null && (
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted">Weight</span>
                <span className="font-medium text-primary">{product.weight} kg</span>
              </div>
            )}
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Condition</span>
              <span className="font-medium text-primary">{product.condition || 'New'}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted">Shipping</span>
              <span className="font-medium text-primary">2-7 business days</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

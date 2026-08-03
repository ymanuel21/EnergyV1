'use client';

import { useState } from 'react';

interface MarkdownToolbarProps {
  onInsert: (markdown: string) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const [showBlocks, setShowBlocks] = useState(false);

  const formatButtons = [
    { label: 'H1', md: '\n# ', tip: 'Heading 1' },
    { label: 'H2', md: '\n## ', tip: 'Heading 2' },
    { label: 'B', md: '**bold**', tip: 'Bold' },
    { label: 'I', md: '*italic*', tip: 'Italic' },
    { label: '•', md: '\n- ', tip: 'Bullet List' },
    { label: '1.', md: '\n1. ', tip: 'Numbered List' },
    { label: '>', md: '\n> ', tip: 'Blockquote' },
    { label: '---', md: '\n---\n', tip: 'Divider' },
    { label: '🔗', md: '[text](https://)', tip: 'Link' },
    { label: '📷', md: '![alt](https://)', tip: 'Image' },
  ];

  const insertBlocks = [
    { label: 'Table', md: '\n| Kolom 1 | Kolom 2 |\n|---------|----------|\n| Data 1 | Data 2 |\n' },
    { label: 'FAQ', md: '\n### ❓ Pertanyaan\n\nJawaban singkat di sini.\n' },
    { label: '⚠️ Warning', md: '\n> ⚠️ **Peringatan:** [teks peringatan]\n' },
    { label: '✅ Success', md: '\n> ✅ **Berhasil:** [pesan sukses]\n' },
    { label: '📞 Contact', md: '\n**Kontak Kami**\n\n- Email: info@ebtplaza.com\n- Telepon: (022) 20522279\n- WhatsApp: 6282112850215\n' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-border mb-3">
      {formatButtons.map((btn) => (
        <button key={btn.label} type="button" title={btn.tip}
          onClick={() => onInsert(btn.md)}
          className="rounded border border-border px-2 py-0.5 text-xs font-medium text-muted hover:bg-surface hover:text-primary transition">
          {btn.label}
        </button>
      ))}
      <div className="relative">
        <button type="button"
          onClick={() => setShowBlocks(!showBlocks)}
          className="rounded border border-border px-2 py-0.5 text-xs font-medium text-muted hover:bg-surface hover:text-primary transition">
          + Insert Block
        </button>
        {showBlocks && (
          <div className="absolute top-full left-0 mt-1 z-10 rounded-lg border border-border bg-card shadow-lg p-1 min-w-[160px]">
            {insertBlocks.map((block) => (
              <button key={block.label} type="button"
                onClick={() => { onInsert(block.md); setShowBlocks(false); }}
                className="w-full text-left rounded px-2 py-1 text-xs text-muted hover:bg-surface hover:text-primary transition">
                {block.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

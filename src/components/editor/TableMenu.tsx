'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';

interface Props { editor: Editor; }

const BTN = 'rounded border border-border px-2 py-1 text-xs text-muted hover:bg-surface hover:text-primary transition whitespace-nowrap';
const DANGER = 'rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition whitespace-nowrap';

export function TableMenu({ editor }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function update() {
      if (!editor.isActive('table')) { setPos(null); return; }
      // Position near the first cell of the table
      const { view } = editor;
      const { state } = view;
      const { selection } = state;
      const $pos = selection.$anchor;
      // Walk up to find the table node
      let depth = $pos.depth;
      while (depth > 0 && $pos.node(depth).type.name !== 'table') depth--;
      if (depth === 0) { setPos(null); return; }

      const start = $pos.start(depth);
      const dom = view.nodeDOM(start);
      if (dom instanceof HTMLElement) {
        const rect = dom.getBoundingClientRect();
        setPos({ top: rect.top - 42, left: rect.left });
      }
    }
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    update();
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  if (!pos || !editor.isActive('table')) return null;

  return (
    <div
      className="fixed z-50 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-2 shadow-xl"
      style={{ top: pos.top, left: pos.left }}
    >
      <span className="text-xs text-muted px-1">Row:</span>
      <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={BTN}>+ Above</button>
      <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={BTN}>+ Below</button>
      <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={DANGER}>- Row</button>

      <span className="w-px h-5 bg-border mx-1" />

      <span className="text-xs text-muted px-1">Col:</span>
      <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={BTN}>+ Left</button>
      <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={BTN}>+ Right</button>
      <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={DANGER}>- Col</button>

      <span className="w-px h-5 bg-border mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        className={`${BTN} ${editor.isActive('table') ? '' : 'opacity-50'}`}>⇔ Header</button>
      <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} className={BTN}>Merge</button>
      <button type="button" onClick={() => editor.chain().focus().splitCell().run()} className={BTN}>Split</button>

      <span className="w-px h-5 bg-border mx-1" />

      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={DANGER}>⌫ Table</button>
    </div>
  );
}

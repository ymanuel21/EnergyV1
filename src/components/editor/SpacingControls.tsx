'use client';

import type { Editor } from '@tiptap/react';

interface Props { editor: Editor; }

const SELECT = 'rounded border border-border bg-card px-2 py-0.5 text-xs text-muted';

export function SpacingControls({ editor }: Props) {
  return (
    <>
      <select
        className={SELECT}
        defaultValue=""
        onChange={e => {
          const v = e.target.value;
          if (!v) return;
          editor.chain().focus().setLineHeight(v).run();
        }}
      >
        <option value="">↕ Line Height</option>
        <option value="1">1.0</option>
        <option value="1.15">1.15</option>
        <option value="1.5">1.5</option>
        <option value="2">2.0</option>
      </select>

      <select
        className={SELECT}
        defaultValue=""
        onChange={e => {
          const px = parseInt(e.target.value);
          if (isNaN(px)) return;
          editor.chain().focus().setSpaceAfter(px).run();
        }}
      >
        <option value="">↔ After</option>
        <option value="0">0px</option>
        <option value="8">8px</option>
        <option value="16">16px</option>
        <option value="24">24px</option>
        <option value="32">32px</option>
      </select>
    </>
  );
}

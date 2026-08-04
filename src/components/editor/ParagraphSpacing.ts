'use client';

import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraphSpacing: {
      setLineHeight: (value: string) => ReturnType;
      setSpaceAfter: (px: number) => ReturnType;
    };
  }
}

export const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          lineHeight: {
            default: null,
            // Read from existing style or the parsed HTML attribute
            parseHTML: (el: HTMLElement) => {
              const existing = el.style.lineHeight;
              if (existing) return existing;
              // Also accept the rendered HTML attribute form (backward compat)
              const attr = el.getAttribute('lineheight') || el.getAttribute('lineHeight');
              return attr || null;
            },
          },
          spaceAfter: {
            default: null,
            parseHTML: (el: HTMLElement) => {
              const existing = el.style.marginBottom;
              if (existing && existing !== '0px') return parseInt(existing);
              const attr = el.getAttribute('spaceafter') || el.getAttribute('spaceAfter');
              return attr ? parseInt(attr) : null;
            },
          },
        },
        // Single merged renderHTML — combines all attributes into one style string.
        // Existing inline styles on the element are preserved via parseHTML above.
        renderHTML: (attrs: Record<string, any>) => {
          const parts: string[] = [];
          if (attrs.lineHeight) parts.push(`line-height: ${attrs.lineHeight}`);
          if (attrs.spaceAfter) parts.push(`margin-bottom: ${attrs.spaceAfter}px`);
          return parts.length > 0 ? { style: parts.join('; ') } : {};
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (value: string) =>
        ({ chain }) =>
          chain().updateAttributes('paragraph', { lineHeight: value }).run(),
      setSpaceAfter:
        (px: number) =>
        ({ chain }) =>
          chain().updateAttributes('paragraph', { spaceAfter: px }).run(),
    };
  },
});

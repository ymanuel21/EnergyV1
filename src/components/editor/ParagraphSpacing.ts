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
            parseHTML: (el: HTMLElement) => el.style.lineHeight || null,
          },
          spaceAfter: {
            default: null,
            parseHTML: (el: HTMLElement) => {
              const mb = el.style.marginBottom || '';
              return mb && mb !== '0px' ? parseInt(mb) : null;
            },
          },
        },
        // Merge both styles into a single style string so neither is dropped
        renderHTML: (attrs: Record<string, any>) => {
          const styles: string[] = [];
          if (attrs.lineHeight) styles.push(`line-height: ${attrs.lineHeight}`);
          if (attrs.spaceAfter) styles.push(`margin-bottom: ${attrs.spaceAfter}px`);
          return styles.length > 0 ? { style: styles.join('; ') } : {};
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

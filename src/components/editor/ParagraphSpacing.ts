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
            renderHTML: (attrs: Record<string, any>) => {
              if (!attrs.lineHeight) return {};
              return { style: `line-height: ${attrs.lineHeight}` };
            },
          },
          spaceAfter: {
            default: null,
            parseHTML: (el: HTMLElement) => {
              const mb = el.style.marginBottom || '';
              return mb && mb !== '0px' ? parseInt(mb) : null;
            },
            renderHTML: (attrs: Record<string, any>) => {
              if (!attrs.spaceAfter) return {};
              return { style: `margin-bottom: ${attrs.spaceAfter}px` };
            },
          },
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
